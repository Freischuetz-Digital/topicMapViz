(function() {
    var toString = Object.prototype.toString,
        //default parser
        parser = function (x) { return x; },
        //gets the item to be sorted
        getItem = function (x) {
            return this.parser((toString.call(x) == "[object Object]" && x[this.prop]) || x);
        };
    // Creates a sort method in the Array prototype
    Object.defineProperty(Array.prototype, "sortBy", {
        configurable: false,
        enumerable: false,
        // @o.prop: property name (if it is an Array of objects)
        // @o.desc: determines descending sort
        // @o.parser: function to parse the items to expected type
        value: function (o) {
            if (toString.call(o) != "[object Object]")
                o = {};
            if (toString.call(o.parser) != "[object Function]")
                o.parser = parser;
            o.desc = !!o.desc;
            //if @o.desc is true: set -1, else 1
            o.desc = [1, -1][+!!o.desc];
            return this.sort(function (a, b) {
                a = getItem.call(o, a);
                b = getItem.call(o, b);
                return o.desc * ((a > b) - (b > a));
              //return o.desc * (a > b ? 1 : (a < b ? -1 : 0));
            });
        }
    });
})();


//own functions

/* function appendFilters
 * append Filters in #filters on the basis of the rendered graph
 * filters will be generated for:
 *  - association classes
 *  - topics
 *  - topic classifications
 */

function appendFilters(data1){
  
  var data = $('#graph svg');
  //console.log(data);
  var data_nodes = $('#graph svg g.node');
  //console.log(data_nodes);
  var nodeNames = new Array();
  var data_associations = $('#graph svg line');
  //console.log(data_associations);
  var associationClasses = new Array();
  
  $.each(data_associations,
    function(i, item){
      var type = item.getAttribute('title');
      console.log(type);
      if($.inArray(type, associationClasses) == -1){
        associationClasses.push(type);
      }
    }
  );
  console.log('appendFilters: associationClasses:');
  console.log(associationClasses);
  
    $.each(data_nodes,
    function(i, item){
      var name = item.textContent;
      var id = item.id;
      console.log(name);
      if($.inArray(name, nodeNames == -1)){
        nodeNames.push({"name": name, "id": id});
      }
    }
  );
  
  if(associationClasses.length > 0){
    d3.select('#filters').append('div').attr('id','filters-classes')
      .append('h4').text('Assoziationstypen');
    
    associationClasses.forEach(function(item, i){
      var newEntry = d3.select('#filters-classes').append('div').classed('filter', true);
      
      newEntry.append('span').classed('filterLabel', true).text(item.substring(item.indexOf('#')+1));
     
      newEntry.append('a').attr('onclick',"mapHighlight('."+item.substring(item.indexOf('#')+1)+"')").classed('filter_highlight', true).text('highlight');
    });
  }
  
  if(nodeNames.length > 0){
    d3.select('#filters').append('div').attr('id','filters-nodes')
     .append('h4').text('Topics');
  
   nodeNames.forEach(function(item, i){
       var newEntry = d3.select('#filters-nodes').append('div').classed('filter', true);
      
      newEntry.append('span').classed('filterLabel', true).text(item.name);
     
      newEntry.append('a').attr('onclick',"mapHighlight('#"+item.id+"')").classed('filter_highlight', true).text('highlight');
       
       
   });
  }
}

/* function clearFilters
 *
 * empties #filters
 */
function clearFilters(){
  $('#filters').empty();
}

/* function to highligh a class in the map
 *
 */
function mapHighlight(identifier){
  //TODO impement toggle
  var obj = $($('#graph '+identifier));
  var highlight_status = obj.attr('class').indexOf('highlight') > -1;
  console.log(highlight_status);
  if(highlight_status){
    obj.attr('class', obj.attr('class').replace(' highlight',''));
  }else{
    obj.attr('class', obj.attr('class') + ' highlight');
  }
}

/* function drawGraph
 * @param  localLinks
 *
 * draws a force graph using d3.js
 */
function drawGraph(localLinks){
  console.log('init: drawGraph');
  // Compute the distinct nodes from the links.
  links.forEach(function(link) {//refer data
   link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, distance: link.distance});
   link.target = nodes[link.target] || (nodes[link.target] = {name: link.target, distance: link.distance});
  });
  console.log('drawGraph:nodes');
  console.log(nodes);
  
   var width = 600,
       height = 300;
   
   var force = d3.layout.force()
       .nodes(d3.values(nodes))
       .links(localLinks) //refer data
       .size([width, height])
       .linkDistance(60)
       .charge(-100)
       .on("tick", tick)
       .start();
   
   var svg = d3.select("#graph").append("svg")
       .attr("width", width)
       .attr("height", height)
       .classed("col-md-12", true);
   
   var link = svg.selectAll(".link")
       .data(force.links())
       .enter().append("line")
         .attr("class", function(d) { return d.type.substring(d.type.indexOf('#')+1) + " link"; })
         .attr("title",function(d) { return d.type.substring(d.type.indexOf('#')+1); });
   
   var node = svg.selectAll(".node")
       .data(force.nodes())
      .enter().append("g")
        .attr("class", function(d) {return "node " + "distance_"+d.distance; })
        .attr("id", function(d) {return "node_" + d.name.substring(d.name.indexOf('#')+1); })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("dblclick", onclick)
        .call(force.drag);
   
   node.append("circle")
       .attr("r", 8);
   
   node.append("text")
       .attr("x", 12)
       .attr("dy", ".35em")
       .text(function(d) {
          console.log(d.name.substring(1));
          var myData = filterById(topicsFiltered, d.name.substring(1));
          console.log(myData);
          if(typeof myData[0] !== 'undefined'){return myData[0].names[0].value;}
          else{return '[fallback]'+d.name}
       });
       
   function tick() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
   
    node
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
   }
   
  function mouseover() {
   d3.select(this).select("circle").transition()
       .duration(750)
       .attr("r", 16);
  }
  
  function mouseout() {
   d3.select(this).select("circle").transition()
       .duration(750)
       .attr("r", 8);
  }
  
  function onclick() {
    var node = d3.select(this);
    var text = node.select("text").text();
    var id = node.property("id");
    selectTopic(id);
  }
//use event mechanism?
clearFilters();
appendFilters($('#graph svg'));
}

// helper functions

/* function filterById
 * @param object   the JSON array to be searched
 * @param value    the value to be retrieved from any roles.player
 *
 * returns JSON array
 */

function filterByMember (object, value) {
    console.log('filterByMember: ' +value);
  // The real meat of the solution, you can use this directly if you want.
  var num = $.map(object, function (item, key) { 
      var regEx = new RegExp(value, 'g');

      // this is where the check is done
      if (item.roles[0].player.substring(item.roles[0].player.indexOf(':')+1) == value || item.roles[1].player.substring(item.roles[1].player.indexOf(':')+1) == value) {

        // if you want the index or property "0", "1", "2"... etc.
        // item._index = key;

        return item;
      }
    });
    
    return num
}

/* function filterById
 * @param object   the JSON array to be searched
 * @param value    the ID value to be retrieved
 *
 * returns JSON object
 */
function filterById (object, value) {

    console.log('filter by id:');
    console.log(value);
  // The real meat of the solution, you can use this directly if you want.
  /*return $.map(object, function (item, key) { 

      // this is where the check is done
      if (item.id === value) {

        // if you want the index or property "0", "1", "2"... etc.
        // item._index = key;

        return item = key; 
      }
      
    });*/
    return $.grep(topicsFiltered, function(element, index){
      
      if(element.item_identifiers[0] === value){
        return element
      }
      
    });
}

/* function renderTopicDetail
 * @param detail
 *
 * TODO: this function shoud be a general function for rendering arbitrary details to detail view in order to promote a more data driven and object oriented setup of this app
 */
function renderTopicDetail(detail){
  
}

/* function getTopicDetails
 * @param topic
 * @param i
 *
 * render topic details to detail area
 */

function getTopicDetails(topic, i){
  
  var newTopic = d3.select('#meta')
    .append('dl').classed('topicDetail dl-horizontal', true);
    
    //topic
    newTopic.append('dt').classed('key', true)
    .text('Topic');
    newTopic.append('dd').classed('value', true)
    .text(topic.names[0].value);
    
    //variant(s)
    if(topic.names[0].variants && typeof topic.names[0].variants !== 'undefined'){
      newTopic.append('dt').classed('key', true)
        .text('Varianten');
      for(i=0; i < topic.names[0].variants.length; i++){
        newTopic.append('dd').classed('value', true)
          .text(topic.names[0].variants[i].value);
      }
    };
    
    //TODO: deprecated
    //declaration
   /* if(topic.declaration){
      newTopic.append('dt').classed('key', true)
        .text('Definition');
      newTopic.append('dd').classed('value', true)
        .text(topic.declaration.bibl);
    };*/
    
    //instanceOf
    newTopic.append('dt').classed('key', true)
      .text('Klassifizierung');
    for(i=0; i < topic.instance_of.length; i++){
      newTopic.append('dd').classed('value', true)
        .text(topic.instance_of[i].substring(topic.instance_of[i].indexOf('#')+1));
    };
    
    //occurrence(s)
    if(topic.occurrences && topic.occurrences.length > 0){
      newTopic.append('dt').classed('key', true)
        .text('Nachweise');
      for(i=0; i < topic.occurrences.length; i++){
        newTopic.append('dd').classed('value', true)
          .text(topic.occurrences[i].value);
      }
    }
    
}

/* function clearTopicDetail
 * clear Detail area
 */
function clearTopicDetail(){
  $('#meta').empty();
  $('#graph').empty();
  var emptyArray = new Array();
  links = emptyArray;
  nodes = emptyArray;
}

/* function selectTopic
 * @param  id
 * @param  i
 *
 * this function is the onclick fnuction for items in the topicList
 * it retrieves the corrsponding JSON object
 * sets the corresponding list entry 'active'
 * clears the detail view from previous topics details
 * retrieves the links for the graph
 * fires drawGraph
 * fires getTopicDetails
 */
function selectTopic(id, i){
  console.log('selectTopic: init');
  console.log('submitted i: '+ i);
  console.log('submitted id: '+ id);
  var currentTopic = filterById(topicsFiltered, id);
  console.log('current topic object:');
  console.log(currentTopic);
  var graphDepth = 2;
  
  $('.topicName').toggleClass('active',false);
  $('#topic_'+id.substring(id.indexOf('#')+1)).toggleClass('active', true);
  
  clearTopicDetail();
  topicLinks = getNodeLinks(id, distance);
  console.log('selectTopic: topicLinks');
  console.log(topicLinks);
  links = topicLinks;
  drawGraph(links);
  getTopicDetails(currentTopic[0], i);
  
}

/* function  getNodeLinks
 * @param    topicID  ID of the topic that should be origin of the graph
 * @param    distance maximum number of node steps between topicID and other nodes
 *
 * this function returns the links d3 needs to render the graph
 */
function getNodeLinks(topicID,distance){
  console.log('determining nodes with parameters: ');
  console.log('topicID: '+topicID);
  console.log('distance: '+distance);
  var filterTopicRef = topicID;
  console.log('filterTopics by ref to: '+ topicID);
  var nodes = filterByMember (associations, topicID);
  if (nodes.length === 0){
    selfTopic = filterById(topicsFiltered, topicID);
console.log(selfTopic);
    nodes.push(
    /*
        reifier null
roles	[Object { type="ii:#role", player="ii:#mutter", reifier=null}, Object { type="ii:#role", player="ii:#foersterin", reifier=null}]
0	Object { type="ii:#role", player="ii:#mutter", reifier=null}
player	"ii:#mutter"
reifier	null
type	"ii:#role"
1	Object { type="ii:#role", player="ii:#foersterin", reifier=null}
player	"ii:#foersterin"
reifier	null
type	"ii:#role"
type	"ii:#same-as"
    */    
    {
      "reifier" : null,
      "roles" : [
          {"player" : 'ii:'+selfTopic[0].item_identifiers,
           "reifier" : null,
           "type" : selfTopic[0].instance_of
          },
          {"player" : 'ii:'+selfTopic[0].item_identifiers,
           "reifier" : null,
           "type" : selfTopic[0].instance_of
          }
      ],
      "type" : 'self'
    }
    )
  }
  console.log('nodes:');
  console.log(nodes);
  
  var distantTopicRefs = new Array();
  var addNodes = [];
  
  if(distance==2){
    console.log('distance=2, start topic loop');
    $.each(nodes, function(i, item){
      console.log('init retrieve association for ');
      console.log(item);
      console.log('enter each loop on nodes');
      $.each(item.roles, function(i, role){
        console.log('enter each loop on node.roles');
        var topicRef = role.player.substring(role.player.indexOf(':')+1);
        if($.inArray(topicRef, distantTopicRefs) == -1 && topicRef !== filterTopicRef){
          
          distantTopicRefs.push(topicRef);
          topicRefNodes = filterByMember (associations, topicRef);
          $.each(topicRefNodes, function(i,item){
              addNodes.push(item);
          })
          console.log('ADD NODES: '+ topicRef)
          console.log(addNodes);
        };
      });
    });
    console.log('distantTopicRefs:');
    console.log(distantTopicRefs);
  }
  console.log('addNodes:');
  console.log(addNodes);
  
  //create links Array
  var myLinks = new Array();
  
  $.each(nodes,function(i, node){
    //{"source": "nacht", "target": "wolfsschluchtszene", "type": "part-of"}
    /*console.log('pos: ' + i);
    console.log(node);*/
    myLinks.push({ 
        "source" : node.roles[0].player.substring(node.roles[0].player.indexOf(':')),//TODO: function get ID
        "target" : node.roles[1].player.substring(node.roles[1].player.indexOf(':')),
        "type"   : node.type,
        "distance" : 1
    });
  });
  console.log('myLinks, distance=1:');
  console.log(myLinks);
  if(distance==2){
    $.each(addNodes, function(i, node){
        myLinks.push({ 
        "source" : node.roles[0].player.substring(node.roles[0].player.indexOf(':')),//TODO: function get ID
        "target" : node.roles[1].player.substring(node.roles[1].player.indexOf(':')),
        "type"   : node.type,
        "distance" : 2
    });
    });  
  }
  console.log('myLinks: distance=2');
  console.log(myLinks);
  
  return myLinks;

}

/*End functions*/

/* global variables
 * 
 */
var links;
var nodes = {};
var json;
var topics;
var topicsFiltered = new Array();
var associations;
var distance = 1;
var currentTopic;

/*
 * load data from filesystem as json using jquery ajax request and populate topicList
 */
$.getJSON("data/xql/getJSONtopicMap.xql", function(data){
  json = data;
  console.log(json);
  topics = data.topics;
  associations = data.associations;
  //console.log(associations);
  
  for (i=0; i < topics.length; i++) {
    
    if(topics[i].names && topics[i].instance_of !='ii:http://psi.ontopia.net/ontology/association-type' && topics[i].instance_of !='ii:http://psi.ontopia.net/ontology/topic-type' && topics[i].instance_of !='ii:#variant-type') {
      topicsFiltered.push(topics[i]);
    }
  }
  //console.log(topicsFiltered);
   
  topicsFiltered.sortBy({prop: "item_identifiers"});
  
  for (i=0; i < topicsFiltered.length; i++) {
    var topic = topicsFiltered[i];
    var topicID = topicsFiltered[i].item_identifiers[0];
    var idString = "'"+topicID+"'";
    var newLi =  $('#topicList').append('<a id="topic_'+topicID.substring(topicID.indexOf('#')+1)+'" class="list-group-item topicName" href="#" onclick="selectTopic('+idString+','+i+')">'+ topicsFiltered[i].names[0].value +'</a>');
    
    
    $('#topicList').btsListFilter('#searchinput', {
        initial: false,
        emptyNode: function(data) {
          return '<a class="list-group-item well" href="#">No Results</a>';
        }
      });
  };
  
}, 'json');
