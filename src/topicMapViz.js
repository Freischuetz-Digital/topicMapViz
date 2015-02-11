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

function appendFilters(data){
  
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
  console.log(associationClasses);
  
    $.each(data_nodes,
    function(i, item){
      var name = item.textContent;
      console.log(name);
      if($.inArray(name, nodeNames == -1)){
        nodeNames.push(name);
      }
    }
  );
  
  if(associationClasses.length > 0){
    d3.select('#filters').append('div').attr('id','filters-classes')
      .append('h4').text('Assoziationstypen');
    
    associationClasses.forEach(function(item, i){
      var newEntry = d3.select('#filters-classes').append('div').classed('filter', true);
      
      newEntry.append('span').classed('filterLabel', true).text(item.substring(item.indexOf('#')+1));
     
      newEntry.append('a').attr('onclick',"mapHighlight('"+item.substring(item.indexOf('#')+1)+"')").classed('filter_highlight', true).text('highlight');
    });
  }
  
  if(nodeNames.length > 0){
    d3.select('#filters').append('div').attr('id','filters-nodes')
     .append('h4').text('Topics');
  
   nodeNames.forEach(function(item, i){
       d3.select('#filters-nodes').append('div')
         .text(item);
   });
  }
 

}

function clearFilters(){
  $('#filters').empty();
};

/* function to highligh a class in the map
 *
 */
function mapHighlight(identifier){
  //TODO impement toggle
  var obj = $($('#graph .'+identifier));
  var highlight_status = obj.attr('class').indexOf('highlight') > -1;
  console.log(highlight_status);
  if(highlight_status){
    obj.attr('class', obj.attr('class').replace(' highlight',''));
  }else{
    obj.attr('class', obj.attr('class') + ' highlight');
  }
};

/* function drawGraph
 * @param  localLinks 
 */
function drawGraph(localLinks){
  
  // Compute the distinct nodes from the links.
  links.forEach(function(link) {//refer data
   link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
   link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
  });
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
        .attr("class", "node")
        .attr("id", function(d) { return d.name.substring(1); })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click", onclick)
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

function filterByMember (object, value) {

  // The real meat of the solution, you can use this directly if you want.
  var num = $.map(object, function (item, key) { 
      var regEx = new RegExp(value, 'g');
      // this is where the check is done
      if (item.roles[0].player.match(regEx) || item.roles[1].player.match(regEx)) {

        // if you want the index or property "0", "1", "2"... etc.
        // item._index = key;

        return item;
      }
    });
    
    return num
}

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

function renderTopicDetail(detail){
  
}

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
    if(topic.occurrence && topic.occurrence.resourceRef){
      newTopic.append('dt').classed('key', true)
        .text('Nachweise');
      for(i=0; i < topic.occurrence.resourceRef.length; i++){
        newTopic.append('dd').classed('value', true)
          .text(topic.occurrence.resourceRef[i].href);
      }
    }
    
}

function clearTopicDetail(){
  $('#meta').empty();
  $('#graph').empty();
  var emptyArray = new Array();
  links = emptyArray;
  nodes = emptyArray;
}

function selectTopic(id, i){
  console.log('start selectTopic');
  console.log('submitted i: '+ i);
  console.log('submitted id: '+ id);
  var currentTopic = filterById(topicsFiltered, id);
  console.log('current topic object:');
  console.log(currentTopic);
  var graphDepth = 2;
  
  $('.topicName').toggleClass('active',false);
  $('#topic_'+id.substring(id.indexOf('#')+1)).toggleClass('active', true); //append class selected
  
  clearTopicDetail();
  topicLinks = getNodeLinks(id, distance);
  links = topicLinks;
  drawGraph(links);
  getTopicDetails(currentTopic[0], i);
  
}

function getNodeLinks(topicID,distance){
  console.log('determining nodes with parameters: ');
  console.log('topicID: '+topicID);
  console.log('distance: '+distance);
  var filterTopicRef = topicID;
  console.log('filterTopics by ref to: '+ topicID);
  var nodes = filterByMember (associations, topicID);
  if (nodes.length == 0){
    nodes.push(
      filterById(topicsFiltered, topicID)
    )
  };
  console.log(nodes);
  
  if(distance==2){
    var distantTopicRefs = new Array();
    //distantTopicRefs.push(filterTopicRef);
    //console.log(filterTopicRef);
    console.log('start topic loop');
    $.each(nodes, function(i, item){
      //distantTopicRefs.push(item.member[0].topicRef.href);
      //distantTopicRefs.push(item.member[1].topicRef.href);
      console.log('enter each loop on nodes');
      $.each(item.roles, function(i, role){
        console.log('enter each loop on node.roles');
        var topicRef = role.player;
        if($.inArray(topicRef, distantTopicRefs) == -1 && topicRef !== filterTopicRef){
          distantTopicRefs.push(topicRef);
          var addNodes = filterByMember (associations, topicRef);
          console.log(addNodes);
          $.each(addNodes, function(i, item){nodes.push(item)});
        };
        
      });
    });
    
    console.log(distantTopicRefs);
    console.log(nodes);
  }
  var myLinks = new Array();
  
  $.each(nodes,function(i, node){
    //{"source": "nacht", "target": "wolfsschluchtszene", "type": "part-of"}
    /*console.log('pos: ' + i);
    console.log(node);*/
    myLinks.push({ 
        "source" : node.roles[0].player.substring(node.roles[0].player.indexOf(':')),//TODO: function get ID
        "target" : node.roles[1].player.substring(node.roles[1].player.indexOf(':')),
        "type"   : node.type 
    });
  });
  
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

/*
 * load data from filesystem as json using jquery ajax request
 */
$.getJSON("getJSONtopicMap.xql", function(data){
  json = data;
  console.log(json);
  topics = data.topics;
  associations = data.associations;
  //console.log(associations);
  
  //
  for (i=0; i < topics.length; i++) {
    
    if(topics[i].names && topics[i].instance_of !='ii:http://psi.ontopia.net/ontology/association-type' && topics[i].instance_of !='ii:http://psi.ontopia.net/ontology/topic-type') {//&& topics[i].instanceOf
      topicsFiltered.push(topics[i]);
    }
  };
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
