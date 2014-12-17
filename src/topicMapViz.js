
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
       .charge(-300)
       .on("tick", tick)
       .start();
   
   var svg = d3.select("#graph").append("svg")
       .attr("width", width)
       .attr("height", height);
   
   var link = svg.selectAll(".link")
       .data(force.links())
       .enter().append("line")
         .attr("class", "link")
         .attr("title",function(d) { return d.type; });
   
   var node = svg.selectAll(".node")
       .data(force.nodes())
      .enter().append("g")
        .attr("class", "node")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .call(force.drag);
   
   node.append("circle")
       .attr("r", 8);
   
   node.append("text")
       .attr("x", 12)
       .attr("dy", ".35em")
       .text(function(d) { return d.name; });
       
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

}
/*functions*/

function filterByMember (object, value) {

  // The real meat of the solution, you can use this directly if you want.
  return $.map(object, function (item, key) { 

      // this is where the check is done
      if (item.member[0].topicRef.href === value || item.member[1].topicRef.href === value) {

        // if you want the index or property "0", "1", "2"... etc.
        // item._index = key;

        return item; 
      }
    });
}

function getTopicDetails(topic, i){
  
  var newTopic = d3.select('#meta')
    .append('dl').classed('topicDetail', true);
    //topic
    newTopic.append('dt').classed('key', true)
    .text('Topic');
    newTopic.append('dd').classed('value', true)
    .text(topic.baseName.baseNameString);
    
    //variant(s)
    if(topic.baseName.variant){
      newTopic.append('dt').classed('key', true)
        .text('Alternative Schreibweisen');
      for(i=0; i < topic.baseName.variant.variantName.length; i++){
        newTopic.append('dd').classed('value', true)
          .text(topic.baseName.variant.variantName[i]);
      }
    };
    
    //declaration
    if(topic.declaration){
      newTopic.append('dt').classed('key', true)
        .text('Definition');
      newTopic.append('dd').classed('value', true)
        .text(topic.declaration.bibl);
    };
    
    //instanceOf
    newTopic.append('dt').classed('key', true)
      .text('Klassifizierung');
    for(i=0; i < topic.instanceOf.length; i++){
      newTopic.append('dd').classed('value', true)
        .text(topic.instanceOf[i].topicRef.href);
    };
    
    //occurrence(s)
    newTopic.append('dt').classed('key', true)
      .text('Nachweise');
    for(i=0; i < topic.occurrence.resourceRef.length; i++){
      newTopic.append('dd').classed('value', true)
        .text(topic.occurrence.resourceRef[i].href);
    }
    
}

function clearTopicDetail(){
  $('#meta').empty();
  $('#graph').empty();
  var emptyArray = new Array();
  links = emptyArray;
  nodes = emptyArray;
}

function selectTopic(i){
  
  var currentTopic = json.topic[i];
  console.log(currentTopic);
  var graphDepth = 2;
  
  $('.topicName').toggleClass('bg-primary',false);
  $('#topic_'+i).toggleClass('bg-primary', true); //append class selected
  
  clearTopicDetail();
  topicLinks = getNodeLinks(currentTopic.id, 1);
  links = topicLinks;
  drawGraph(links);
  getTopicDetails(currentTopic, i);
  
}

function getNodeLinks(topicID,distance){

  //console.log(associations);
  
  var filterTopicRef = '#' + topicID;
  //console.log(filterTopicRef);
  var nodes = filterByMember (associations, filterTopicRef);
  console.log(nodes);
  
  var myLinks = new Array();
  
  nodes.forEach(function(node){
    //{"source": "nacht", "target": "wolfsschluchtszene", "type": "part-of"}
    myLinks.push({ 
        "source" : node.member[0].topicRef.href,
        "target" : node.member[1].topicRef.href,
        "type"   : node.instanceOf[0].topicRef.href 
    });
  });
  
  console.log(myLinks);
  
  return myLinks;

}

/*End functions*/
var links;
var nodes = {};
var json;
var topics;
var associations;

$.getJSON("data/FreiDi_topicMap.JSON", function(data){
  json = data;
  //console.log(json);
  topics = data.topic;
  //console.log(topics);
  associations = data.association;
  //console.log(associations);
  
  console.log(json.topic.length);
  
  for (i=0; i < json.topic.length; i++) {
    
      if(json.topic[i].baseName && json.topic[i].instanceOf) {
        $('#topicList').append('<li id="topic_'+i+'" class="topicName"><a href="#" onclick="selectTopic('+i+')">'+ json.topic[i].baseName.baseNameString +"</a></li>");
      };
  
  };
  
}, 'json');
