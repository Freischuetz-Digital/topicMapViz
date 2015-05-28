xquery version "3.0";

import module namespace config="http://www.freischuetz-digital.de/topicMapViz/config" at "../../modules/config.xqm";

declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";

 let $doc := xmldb:document($config:app-root||'/topicMaps/FreiDi_TopicMap_2.xml')
 let $xslt := xmldb:document($config:app-root||'/data/xslt/tmxsl/xtm2tojtm1.xsl')
 
 let $jtm := transform:transform($doc, $xslt, <parameters><param name="jtm_version" value="1.1"/></parameters>)
 
 return
  $jtm