(function(){
	var datafile = "../data/csv/Multi.csv";
	//var datafile = "/~/";
	function run(){
		console.log("run finally!");
	};

	setTimeout(function(){d3 = 22},10000);

	function delayRun(){
		console.log("run delay");


		if(!!d3){
			run();
		}
		else{
			setTimeout(delayRun, 350);
		}
	}
	delayRun();

})();