$(document).ready(function(){

$('#aggregateButton').click (function() {
	$('.modal-title').html("Create aggregation");
	$('.modal-body').html("");
	$('.modal-body').append("<div id='aggregateSelectionDiv'><form class='form-horizontal'><fieldset id='aggregateFieldset'></fieldset></form></div>");
	$("#aggregateFieldset").append('<div class="aggregateSection"> </div>');
	addAggregateSection(0);
	addGroupBySection ();
	$("#go_button").click( function () {
		$('.modal-title').html("Aggregation");
		executeAggregateQuery(generateQuery());
	});
})
 
});

function addAggregateSection (rowNumber) {

	$(".addMoreButton").hide();
	inputsectionId = 'aggregateInputSection'+rowNumber
	$(".aggregateSection").append('<div id="'+inputsectionId+'" class="aggregateInputSection"><div>')
	$("#"+inputsectionId).append('<div class="form-group">'+ 
		'<label class="control-label col-sm-3" for="aggregateType">Aggregate Type</label>'+
  		'<div class="col-sm-8">'+
    		'<select id="aggregateType'+rowNumber+'" name="aggregateType" class="input-xlarge form-control">'+
    			'<option>None</option>'+
    			'<option>Count</option>'+
      			'<option>Sum</option>'+
      			'<option>Average</option>'+
    		'</select>'+
  		'</div></div>');

		$("#"+inputsectionId).append('<div class="control-group form-group">'+ 
		'<label class="control-label col-sm-3" for="aggregateType">Column</label>'+
  		'<div class="col-sm-8">'+
    		'<select id="aggregateColumn'+rowNumber+'" name="aggregateType" class="input-xlarge form-control">'+
    		'</select>'+
  		'</div></div>');
	
	var columns = $("#results").handsontable("getColHeader");
	i=0;
	for (var i = 0; i < columns.length; i++) { 
		// console.log(i);
		$("#aggregateColumn"+rowNumber).append('<option>'+columns[i]+'</option>');
	}

	rowNumber = rowNumber+1;

	$("#"+inputsectionId).append("<a class='col-xs-offset-2 addMoreButton' onclick='addAggregateSection("+rowNumber+")'>+Add more</a>");

}

function addGroupBySection () {
	$("#aggregateFieldset").append('<div class="container-fluid"> <div class="row aggregateGroupBySection"></br></div></div>');
	$(".aggregateGroupBySection").append('<div class="form-group">'+ 
		'<label class="control-label col-sm-3" for="aggregateType">Group By</label>'+
  		'<div class="col-sm-8">'+
    		'<select id="groupByColumn" name="aggregateType" class="input-xlarge form-control">'+
    		'</select>'+
  		'</div></div>');
	var columns = $("#results").handsontable("getColHeader");
	// console.log(columns);
	for (i = 0; i < columns.length; i++) { 
		$("#groupByColumn").append('<option>'+columns[i]+'</option>');
	}

}

function addAggregateOption (rowNumber) {
	$('#aggregateSelectionDiv').append("</br>"+generateAggregateSection(rowNumber));
}

function generateQuery () {
	numRows = $(".aggregateInputSection").length;
	var query = "SELECT ";
	for (i = 0; i < numRows; i++) { 
		if ($("#aggregateType"+i).val()=='None') {
			query+= $("#aggregateColumn"+i).val()+" ";
		} else if ($("#aggregateType"+i).val()=='Sum') {
			query+= "sum("+$("#aggregateColumn"+i).val()+") ";
		} else if ($("#aggregateType"+i).val()=='Average') {
			query+= "avg("+$("#aggregateColumn"+i).val()+") ";
		} else {
			query+= $("#aggregateType"+i).val()+"("+$("#aggregateColumn"+i).val()+") ";
		}

		if(i<numRows-1) {
			query+=",";
		}
	}
	query+="from finalproject6830.test.cpw_events group by "+$("#groupByColumn").val();
	return query;
}

function executeAggregateQuery(query) {
	transport = new Thrift.Transport("http://datahub.csail.mit.edu/service/json"),
	protocol = new Thrift.Protocol(transport),
	client = new DataHubClient(protocol),
	con_params = new ConnectionParams({'user': 'finalproject6830', 'password': 'databases'}),
	con = client.open_connection(con_params),
	// res = client.execute_sql(con, 'select col0 from finalproject6830.test.cpw_events group by col0');
	res = client.execute_sql(con, query);

	$(".modal-body").html("<table id='aggregateResults'></table>");
	var data = res.tuples.map(function (tuple) { return tuple.cells; });
	var columnNames = res.field_names;
	$('#aggregateResults').handsontable({
		data: data,
		minSpareRows: 1,
		colHeaders: columnNames,
		contextMenu: true
	});
}