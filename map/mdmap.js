

(function(){
	var dataFile = "../data/csv/Multi.csv";
	//var datafile = "/~/"; //point to Multi.csv

	//TAKEN FROM multidimensional.js: coerceNum and parserM
	function coerceNum(v){
		var n = +(v+"");
		return (v===null || v==="NA" || isNaN(n)) ? null : n;
	}

	function parserM(d){
		var row = {};
		row.pop = coerceNum(d.AdultPop);
		row.geo = d.CBSA; //slightly different from multidimensional.js
		row.name = d.Metro;
		row.race = d.Race;

		var dis = [
			{level: coerceNum(d.DBLY), share: coerceNum(d.DBLY_SH), title: "Any two or more disadvantages"},
			{level: coerceNum(d.LI_CP), share: coerceNum(d.LI_CP_SH), title: "Low income and poor locale"},
			{level: coerceNum(d.LI_LE), share: coerceNum(d.LI_LE_SH), title: "Low income and limited education"},
			{level: coerceNum(d.LI_HI), share: coerceNum(d.LI_HI_SH), title: "Low income and no health insurance"},
			{level: coerceNum(d.LI_NW), share: coerceNum(d.LI_NW_SH), title: "Low income and nonworking"}			
		]

		row.disadvantage = dis;
		return row;
	}

	//build the map inside of the run method
	function run(){
		var dom = {};
		d3.csv(dataFile, parserM, function(dat){
			var nest = d3.nest()
			 .key(function(d,i){return d.geo})
			 .key(function(d,i){return d.race});
			
			var map = nest.map(dat);
			var entries = nest.entries(dat);
			console.log(entries);

			dom.mapwrap = d3.select("#multidimensional-disadvantage-mapwrap");
			dom.menu = dom.mapwrap.append("div");
			dom.map = dom.mapwrap.append("div");

			var dmap = new dotMap(dom.map.node()).draw();	
			//dmap.setData(entries,"key").makeResponsive().draw(function(){alert("redraw")}).showToolTips();	

		});
		console.log("d3 loaded...  building map...");
	};


	//use a polling function to delay calling the run method until d3 has been loaded
	function delayRun(){
		var readyToGo = false;
		try{
			if(d3.version == "3.5.11"){
				var readyToGo = true;
			}
			else{
				throw "NO.D3";
			}
		}
		catch(e){
			var readyToGo = false;
			setTimeout(delayRun, 150);
		}
		finally{
			if(readyToGo){
				run();
			}
		}
	}
	delayRun();

})();