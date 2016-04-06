//to do: account for null values in formatting and display

(function(){
	var dom = {};
	var session = {svg:true};
	var data = {s:null, m:null}; //(s)ingle dimension and (m)ulti-dimensional disadvantage data sets
	var format = {};
	 var formatNum = d3.format(",.0");
	 var formatShare = d3.format(",.1%");
	format.num = function(v){return v===null ? "NA" : formatNum(v)}
	format.share = function(v){return v===null ? "NA" : formatShare(v)}

	dom.wrap = d3.select("#multidimensional-disadvantage-wrap");
	dom.charts = {};

	dom.charts.singleWrap = d3.select("#md-graphics-single").style({"margin":"25px 0px 0px 0px"});
	dom.charts.multiWrap = d3.select("#md-graphics-multi").style({"margin":"35px 0px 10px 0px"});
	dom.menu = d3.select("#md-menu")

	if(!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")){
		dom.wrap.node().innerHTML = '<p style="font-style:italic;text-align:center;margin:30px 0px 30px 0px;">This interactive feature requires a modern browser such as Chrome, Firefox, IE9+, or Safari.</p>';
		session.svg = false;
	}

	session.repo = "/";
	session.repo = "./data/csv/";

	function coerceNum(v){
		var n = +(v+"");
		return (v===null || v==="NA" || isNaN(n)) ? null : n;
	}

	function parserS(d){
		var row = {};
		row.pop = coerceNum(d.AdultPop);
		row.geo = {cbsa: d.CBSA, name:d.Metro};
		row.race = d.Race;
		
		var dis = [
			{level: coerceNum(d.ConcPov), share: coerceNum(d.ConcPovSh), title: "Poor locale (living in concentrated poverty)"},
			{level: coerceNum(d.LimitEd), share: coerceNum(d.LimitEdSh), title: "Limited education (no high school diploma)"},
			{level: coerceNum(d.LowInc), share: coerceNum(d.LowIncSh), title: "Low income (150% of federal poverty line)"},
			{level: coerceNum(d.NoInsure), share: coerceNum(d.NoInsureSh), title: "No health insurance"},
			{level: coerceNum(d.NonWorking), share: coerceNum(d.NonWorkingSh), title: "Nonworking"}
		]

		row.disadvantage = dis;
		return row;
	}

	function parserM(d){
		var row = {};
		row.pop = coerceNum(d.AdultPop);
		row.geo = {cbsa: d.CBSA, name:d.Metro};
		row.race = d.Race;

		var dis = [
			{level: coerceNum(d.LI_CP), share: coerceNum(d.LI_CP_SH), title: "Low income and poor locale"},
			{level: coerceNum(d.LI_HI), share: coerceNum(d.LI_HI_SH), title: "Low income and no health insurance"},
			{level: coerceNum(d.LI_LE), share: coerceNum(d.LI_LE_SH), title: "Low income and limited education"},
			{level: coerceNum(d.LI_NW), share: coerceNum(d.LI_NW_SH), title: "Low income and nonworking"},
			{level: coerceNum(d.LI_2P), share: coerceNum(d.LI_2P_SH), title: "Low income and two or more other disadvantages"}
		]

		row.disadvantage = dis;
		return row;
	}

	d3.csv(session.repo+"Single.csv", parserS, function(dat){
		var nest = d3.nest()
		 .key(function(d,i){return d.geo.cbsa})
		 .key(function(d,i){return d.race});

		var final = {};
		final.map = nest.map(dat);
		final.entries = nest.entries(dat);		 
		data.single = final;
		
		run();
	});

	d3.csv(session.repo+"Multi.csv", parserM, function(dat){
		var nest = d3.nest()
		 .key(function(d,i){return d.geo.cbsa})
		 .key(function(d,i){return d.race});
		
		var final = {};
		final.map = nest.map(dat);
		final.entries = nest.entries(dat);

		//add in a simple listing of metro areas for use in select menu
		data.metros = final.entries.map(function(d,i){return d.values[0].values[0].geo })
								   .sort(function(a,b){
								   		if(a.cbsa=="88888"){return -1}
								   		else if(b.cbsa=="88888"){return 1}
								   		else{return a.cbsa < b.cbsa ? -1 : 1}
								   });

		data.multi = final;

		run();
	});

	function setSelect(){

		dom.select = {};
		var selwrap1 = dom.menu.append("div").classed("half-width",true);
		var selwrap2 = dom.menu.append("div").classed("half-width",true);

		selwrap1.append("p").text("SELECT A METRO AREA").style({"margin":"3px 5px", "font-size":"11px", "color":"#666666"});
		dom.select.metro = selwrap1.append("select").style({"width":"90%"});
		selwrap2.append("p").text("SELECT A RACE / ETHNICITY").style({"margin":"3px 5px", "font-size":"11px", "color":"#666666"});
		dom.select.race = selwrap2.append("select").style({"width":"90%"});
		
		var options = dom.select.metro.selectAll("option").data(data.metros);
		options.enter().append("option");
		options.exit().remove();
		options.attr("value",function(d,i){return d.cbsa});
		options.text(function(d,i){return d.name});

		var opt = dom.select.race.selectAll("option").data([{c:"All", l:"All races/ethnicities"}, 
															{c:"White", l:"White"}, 
															{c:"Black", l:"Black"}, 
															{c:"Hispanic", l:"Hispanic"}]);
		opt.enter().append("option");
		opt.exit().remove();
		opt.attr("value",function(d,i){return d.c});
		opt.text(function(d,i){return d.l});
	}

	function drawCharts(){
		//need to modify title information based on data
		dat = getData();

		var maxBar = 400;
		var col = "#F20505";

		var maxSingle = d3.max(dat.single.disadvantage, function(d,i){return d.share});
		var maxMulti = d3.max(dat.multi.disadvantage, function(d,i){return d.share});

		var NH1 = Math.round(maxBar*maxSingle);
		var NH2 = Math.round(maxBar*maxMulti)
		var newHeight1 = NH1 < 170 ? 170 : NH1;
		var newHeight2 = NH2 < 170 ? 170 : NH2;
		var topPad = 50;

		var g1 = dom.charts.single.selectAll("div").data(dat.single.disadvantage);
		g1.enter().append("div").classed("one-fifth",true).append("svg").style({"width":"100%", "border-bottom":"1px solid #dddddd"})
			.append("g").classed("single-bar-chart",true).attr("transform","translate(0,"+topPad+")");
		g1.exit().remove();

		var g1Titles = g1.selectAll("p").data(function(d,i){return [d.title]});
		g1Titles.enter().append("p");
		g1Titles.exit().remove();
		g1Titles.text(function(d,i){return d}).style({"text-align":"center","font-size":"13px","margin":"0px 10px"});

		var g1g = g1.select("g.single-bar-chart");

		var g1b = g1g.selectAll("rect").data(function(d,i){return [d]});
		g1b.enter().append("rect").attr({"width":"50%", "x":"25%", "fill":col, "stroke":"none"});
		g1b.exit().remove();
		g1b.transition()
			.attr("height", function(d,i){return d.share*maxBar})
			.attr("y", function(d,i){return newHeight1-(d.share*maxBar)});

		var g1t = g1g.selectAll("text.front-text").data(function(d,i){return [d]});
		g1t.enter().append("text").classed("front-text",true).attr({"x":"50%", "text-anchor":"middle"}).style("font-size","28px");
		g1t.exit().remove();
		g1t.text(function(d,i){return format.share(d.share)} );
		g1t.attr("fill",function(d,i){
			return col;
		}).transition().attr("y",function(d,i){
			return newHeight1-(d.share*maxBar)-3;
		})


		var g2 = dom.charts.multi.selectAll("div").data(dat.multi.disadvantage);
		g2.enter().append("div").classed("one-fifth",true).append("svg").style({"width":"100%", "border-bottom":"1px solid #dddddd"})
			.append("g").classed("single-bar-chart",true).attr("transform","translate(0,"+topPad+")");
		g2.exit().remove();

		var g2Titles = g2.selectAll("p").data(function(d,i){return [d.title]});
		g2Titles.enter().append("p");
		g2Titles.exit().remove();
		g2Titles.text(function(d,i){return d}).style({"text-align":"center", "font-size":"13px", "margin":"0px 10px"});

		var g2g = g2.select("g.single-bar-chart");

		var g2b = g2g.selectAll("rect").data(function(d,i){return [d]});
		g2b.enter().append("rect").attr({"width":"50%", "x":"25%", "fill":col, "stroke":"none"});
		g2b.exit().remove();
		g2b.transition()
			.attr("height", function(d,i){return d.share*maxBar})
			.attr("y", function(d,i){return newHeight2-(d.share*maxBar)});

		var g2t = g2g.selectAll("text.front-text").data(function(d,i){return [d]});
		g2t.enter().append("text").classed("front-text",true).attr({"x":"50%", "text-anchor":"middle", y:(maxBar-10)+"px"}).style("font-size","28px");
		g2t.exit().remove();
		g2t.text(function(d,i){return format.share(d.share)} );
		g2t.attr("fill",function(d,i){
			return col;
		}).transition().attr("y",function(d,i){
			return newHeight2-(d.share*maxBar)-3;
		})	

		dom.charts.single.selectAll("svg").transition().style("height", (newHeight1+topPad)+"px");	
		dom.charts.multi.selectAll("svg").transition().style("height", (newHeight2+topPad)+"px");
	}

	function getData(){
		var metro = dom.select.metro.node().value;
		var race = dom.select.race.node().value;
		var single = data.single.map[metro][race][0];
		var multi = data.multi.map[metro][race][0];
		return {single:single, multi:multi};
	}

	function run(){
		if(data.single && data.multi){

			var t1wrap = dom.charts.singleWrap.append("div").style("padding","5px 10px");
			t1wrap.append("p").text("Dimensions of disadvantage").style({"font-size":"22px"});
			dom.charts.sub1 = t1wrap.append("p").text("SHARE OF THE ADULT POPULATION, YEAR").style({"font-size":"11px", color:"#666666"});
			dom.charts.single = dom.charts.singleWrap.append("div").style({"border":"1px solid #aaaaaa","padding":"5px"}).classed("c-fix",true);

			var t2wrap = dom.charts.multiWrap.append("div").style("padding", "5px 10px");
			t2wrap.append("p").text("Clustered, or multi-dimensional disadvantage").style({"font-size":"22px"});
			dom.charts.sub2 = t2wrap.append("p").text("SHARE OF THE ADULT POPULATION, YEAR").style({"font-size":"11px", color:"#666666"});
			dom.charts.multi = dom.charts.multiWrap.append("div").style({"border":"1px solid #aaaaaa","padding":"5px"}).classed("c-fix",true);

			//{1} - build select menus
			setSelect();
			//{2} - add callbacks
			dom.select.metro.on("change",drawCharts);
			dom.select.race.on("change",drawCharts);

			drawCharts();

		}
	}


})(); //end of closure