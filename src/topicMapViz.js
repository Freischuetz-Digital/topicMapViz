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


/*own functions*/
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
       .attr("height", height);
   
   var link = svg.selectAll(".link")
       .data(force.links())
       .enter().append("line")
         .attr("class", function(d) { return d.type.substring(1) + " link"; })
         .attr("title",function(d) { return d.type.substring(1); });
   
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
          var myDataIndex = filterById(topicsFiltered, d.name.substring(1));
          var myData = topicsFiltered[myDataIndex];
          console.log(myData);
          if(myDataIndex != -1){return myData.baseName.baseNameString;}
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

function filterById (object, value) {

  // The real meat of the solution, you can use this directly if you want.
  return $.map(object, function (item, key) { 

      // this is where the check is done
      if (item.id === value) {

        // if you want the index or property "0", "1", "2"... etc.
        // item._index = key;

        return item._index = key; 
      }
    });
}

function getTopicDetails(topic, i){
  
  var newTopic = d3.select('#meta')
    .append('dl').classed('topicDetail dl-horizontal', true);
    //topic
    newTopic.append('dt').classed('key', true)
    .text('Topic');
    newTopic.append('dd').classed('value', true)
    .text(topic.baseName.baseNameString);
    
    //variant(s)
    if(topic.baseName.variant){
      newTopic.append('dt').classed('key', true)
        .text('Varianten');
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
    if(topic.occurrence && topic.occurrence.resourceRef.length > 0){
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
  var currentTopic_i = filterById(topicsFiltered, id);
  /*console.log('topic determined by id: ');
  console.log(currentTopic1);//hier geht was schief für clicks in den graph
  if(typeof i === 'undefined'){
    console.log('i is undefined will be determined');
    i= $.inArray(currentTopic1,topicsFiltered);
  };*/
  console.log('determined i as:');
  console.log(currentTopic_i);
  currentTopic2 = topicsFiltered[currentTopic_i]; //warum ist das nötig?
  console.log('topic determined by i: ');
  console.log(currentTopic2);
  var graphDepth = 2;
  
  $('.topicName').toggleClass('bg-primary',false);
  $('#topic_'+id).toggleClass('bg-primary', true); //append class selected
  
  clearTopicDetail();
  topicLinks = getNodeLinks(id, distance);
  links = topicLinks;
  drawGraph(links);
  getTopicDetails(currentTopic2, i);
  
}

function getNodeLinks(topicID,distance){
  console.log('determining nodes with parameters: ');
  console.log('topicID: '+topicID);
  console.log('distance: '+distance);
  var filterTopicRef = '#' + topicID;
  //console.log(filterTopicRef);
  var nodes = filterByMember (associations, filterTopicRef);
  console.log(nodes);
  
  if(distance==2){
    var distantTopicRefs = new Array();
    //distantTopicRefs.push(filterTopicRef);
    //console.log(filterTopicRef);
    console.log('start topic loop');
    $.each(nodes, function(i, item){
      //distantTopicRefs.push(item.member[0].topicRef.href);
      //distantTopicRefs.push(item.member[1].topicRef.href);
      $.each(item.member, function(i, member){
        var href = member.topicRef.href;
        if($.inArray(href, distantTopicRefs) == -1 && href !== filterTopicRef){
          distantTopicRefs.push(href);
          var addNodes = filterByMember (associations, href);
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
var topicsFiltered = new Array();
var associations;
var distance = 1;

$.getJSON("data/FreiDi_topicMap.JSON", function(data){
  json = data;
  //console.log(json);
  topics = data.topic;
  associations = data.association;
  //console.log(associations);
  
  for (i=0; i < topics.length; i++) {
    
    if(topics[i].baseName && topics[i].instanceOf) {
      topicsFiltered.push(topics[i]);
    }
  };
  //console.log(topicsFiltered);
   
  topicsFiltered.sortBy({prop: "id"});
  
  for (i=0; i < topicsFiltered.length; i++) {
    var topic = topicsFiltered[i];
    var idString = "'"+topicsFiltered[i].id+"'";
    var newLi =  $('#topicList').append('<a id="topic_'+idString+'" class="list-group-item topicName" href="#" onclick="selectTopic('+idString+','+i+')">'+ topicsFiltered[i].baseName.baseNameString +'</a>');
    
    
    $('#topicList').btsListFilter('#searchinput', {
        initial: false,
        emptyNode: function(data) {
          return '<a class="list-group-item well" href="#">No Results</a>';
        }
      });
  };
  
}, 'json');
