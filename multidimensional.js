(function(){
	var dom = {};
	var session = {svg:true};
	var data = {s:null, m:null}; //(s)ingle dimension and (m)ulti-dimensional disadvantage data sets

	dom.wrap = d3.select("#multidimensional-disadvantage-wrap");
	dom.charts = {};
	dom.charts.single = d3.select("#md-graphics-single");
	dom.charts.multi = d3.select("#md-graphics-multi");
	dom.menu = d3.select("#md-menu");

	if(!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")){
		dom.wrap.node().innerHTML = '<p style="font-style:italic;text-align:center;margin:30px 0px 30px 0px;">This interactive feature requires a modern browser such as Chrome, Firefox, IE9+, or Safari.</p>';
		session.svg = false;
	}

	session.repo = "/";
	session.repo = "./data/csv/";

	function coerceNum(v){
		return (v===null || v==="NA") ? null : +(v+"");
	}

	function parserS(d){
		var row = {};
		row.pop = coerceNum(d.AdultPop);
		row.geo = {cbsa: d.CBSA, name:d.Metro};
		row.race = d.Race;
		
		var dis = {};
		dis.cp = {level: coerceNum(d.ConcPov), share: coerceNum(d.ConcPovSh), title: "Poor locale (living in concentrated poverty)"};
		dis.le = {level: coerceNum(d.LimitEd), share: coerceNum(d.LimitEdSh), title: "Limited education (no high school diploma)"};
		dis.li = {level: coerceNum(d.LowInc), share: coerceNum(d.LowIncSh), title: "Low income (150% of federal poverty line)"};
		dis.hi = {level: coerceNum(d.NoInsure), share: coerceNum(d.NoInsureSh), title: "No health insurance"};
		dis.nw = {level: coerceNum(d.NonWorking), share: coerceNum(d.NonWorkingSh), title: "Nonworking"};

		row.disadvantage = dis;
		return row;
	}

	function parserM(d){
		var row = {};
		row.pop = coerceNum(d.AdultPop);
		row.geo = {cbsa: d.CBSA, name:d.Metro};
		row.race = d.Race;

		var dis = {};
		dis.licp = {level: coerceNum(d.LI_CP), share: coerceNum(d.LI_CP_SH), title: "Low income and poor locale"};
		dis.lihi = {level: coerceNum(d.LI_HI), share: coerceNum(d.LI_HI_SH), title: "Low income and no health insurance"};
		dis.li2p = {level: coerceNum(d.LI_2P), share: coerceNum(d.LI_2P_SH), title: "Low income and two or more other disadvantages"};
		dis.lile = {level: coerceNum(d.LI_LE), share: coerceNum(d.LI_LE_SH), title: "Low income and limited education"};
		dis.linw = {level: coerceNum(d.LI_NW), share: coerceNum(d.LI_NW_SH), title: "Low income and nonworking"};

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

		dom.menu.append("p").text("SELECT A METRO AREA").style({"margin":"3px 15px", "font-size":"11px", "color":"#666666"});
		dom.select = dom.menu.append("select");
		
		var options = dom.select.selectAll("option").data(data.metros);
		options.enter().append("option");
		options.exit().remove();
		options.attr("value",function(d,i){return d.cbsa});
		options.text(function(d,i){return d.name});
	}

	function drawCharts(cbsa){
		var single = data.single.map[cbsa];
		var multi = data.multi.map[cbsa];
		console.log(single);
		console.log(multi);
	}

	function run(){
		if(data.single && data.multi){
			//{1} - build select menu
			setSelect();
			//{2} - add select callback
			dom.select.on("change",function(d,i){
				drawCharts(this.value);
			})
		}
	}


})(); //end of closure