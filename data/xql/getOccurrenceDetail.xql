xquery version "3.0";

import module namespace config="http://www.freischuetz-digital.de/topicMapViz/config" at "../../modules/config.xqm";
import module namespace freidi-tmv="http://www.freischuetz-digital.de/topicMapViz/app" at "../../modules/app.xql";


declare namespace tei = "http://www.tei-c.org/ns/1.0";

(:declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";:)
declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes";


declare variable $href := request:get-parameter('href','');
declare variable $docName := substring-before($href, '#');
declare variable $topicID := substring-after($href, '#');

let $doc := xmldb:document($freidi-tmv:text-root||$docName)
let $xslt := xmldb:document($config:app-root||'/data/xslt/getOccurenceDetail.xsl')
 
let $result := transform:transform($doc, $xslt, <parameters><param name="topicID" value="{$topicID}"/></parameters>)
 
return
(:<a href="{$href}">{$docName || 'with ID: ' || $topicID}</a>:)
(:element root {
for $occurence in $doc//tei:*[@key = $topicID]
return $occurence/parent::tei:*

}:)
serialize($result)