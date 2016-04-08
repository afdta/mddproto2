

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
		row.dbly = {level: coerceNum(d.DBLY), share: coerceNum(d.DBLY_SH), title: "Any two or more disadvantages"}
		return row;
	}

	//build the map inside of the run method -- d3 will be available when run is called
	function run(){
		var format = {};
		 var formatNum = d3.format(",.0");
		 var formatShare = d3.format(",.1%");
		format.num = function(v){return v===null ? "NA" : formatNum(v)}
		format.share = function(v){return v===null ? "NA" : formatShare(v)}

		var dom = {};

		//BUILD SELECT MENU
		dom.mapwrap = d3.select("#multidimensional-disadvantage-mapwrap");
		dom.menu = dom.mapwrap.append("div");
		dom.map = dom.mapwrap.append("div");
		dom.select = dom.menu.append("select");

		var opt = dom.select.selectAll("option").data([{c:"All", l:"All races/ethnicities"}, 
														{c:"White", l:"White"}, 
														{c:"Black", l:"Black"}, 
														{c:"Hispanic", l:"Hispanic"}]);
		opt.enter().append("option");
		opt.exit().remove();
		opt.attr("value",function(d,i){return d.c});
		opt.text(function(d,i){return d.l});
		//END SELECT MENU

		var accessor = function(d){
			var race = dom.select.node().value;
			var arr = d.values;
			var v = null;

			for(var i=0; i<arr.length; i++){
				if(arr[i].key==race){
					v = arr[i].values[0].dbly.share;
					break;
				}
			}

			return v;
		}
		var tA = function(d){
			var race = dom.select.node().value;
			var arr = d.values;
			var v = null;

			for(var i=0; i<arr.length; i++){
				if(arr[i].key==race){
					v = arr[i].values[0].dbly.share;
					break;
				}
			}

			var rt = {"White":"white adult population", 
					  "Black":"black adult population", 
					  "Hispanic":"Hispanic adult population", 
					  "All":"total adult population"};

			return ['<span style="font-size:11px;line-height:1.25em;">Share of the ' + rt[race] + '<br/>that is doubly disadvantaged</span>', '<p style="font-size:32px;line-height:1em;">'+format.share(v)+'</p>'];
		}
		var dotSize = function(v){
			var max = 1; //100%
			var maxR = 20;
			var maxA = Math.PI*(maxR*maxR);
			var self = this;

			var ratio = v/max;
			var area = ratio*maxA;
			var r = Math.sqrt(area/Math.PI);
			
			return r;			
		}

		var col = "#c1272d";
		var cols = d3.interpolateLab("#ffffff", col);
		var dotFill = function(v){
			var ratio =  v/0.45;
			if(ratio > 1){ratio = 1}
			var c = cols(ratio);
			return c;
		}

		d3.csv(dataFile, parserM, function(dat){
			var nest = d3.nest()
			 .key(function(d,i){return d.geo})
			 .key(function(d,i){return d.race});
			
			var map = nest.map(dat);
			var entries = nest.entries(dat);

			var dmap = new dotMap(dom.map.node()).draw();	
			dmap.setData(entries,"key").makeResponsive().draw(function(){}).showToolTips(tA);	
			dmap.setAccessor(accessor);
			dmap.setAes("r", dotSize);
			dmap.setAes("fill", dotFill);

			dom.select.on("change",function(d,i){
				dmap.setAes("r", dotSize, true);
				dmap.setAes("fill", dotFill, true); //r and fill can transition concurrently
			})

		});
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