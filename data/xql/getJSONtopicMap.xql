xquery version "3.0";
declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

 let $doc := xmldb:document('/db/apps/topicMapViz/FreiDi_TopicMap_2.xml')
 let $xslt1 := xmldb:document('/db/apps/topicMapViz/tm-converter/xtm1toxtm2.xsl')
 let $xslt2 := xmldb:document('/db/apps/topicMapViz/tm-converter/xtm2tojtm1.xsl')
 
 let $xtm2 := transform:transform($doc, $xslt1, ())
 let $jtm := transform:transform($doc, $xslt2, ())
 
 return
  $jtm