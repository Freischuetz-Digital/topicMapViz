xquery version "3.0";

import module namespace config="http://www.freischuetz-digital.de/topicMapViz/config" at "../../modules/config.xqm";
import module namespace freidi-tmv="http://www.freischuetz-digital.de/topicMapViz/app" at "../../modules/app.xql";
import module namespace kwic="http://exist-db.org/xquery/kwic";
import module namespace expath="http://expath.org/ns/pkg";


declare namespace tei = "http://www.tei-c.org/ns/1.0";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";
(: declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes"; :)


declare variable $href := request:get-parameter('href','');
declare variable $docName := substring-before($href, '#');
declare variable $topicID := substring-after($href, '#');
declare variable $collectionURI := if(contains($docName, 'librettoSource'))then($freidi-tmv:librettoSource-root)else($freidi-tmv:referenceSource-root);
declare variable $table :=request:get-parameter('table', 'no');
declare variable $truncate :=request:get-parameter('truncate', '60');
declare variable $freidi-EO-root := if(expath:pkg-installed('http://www.edirom.de/apps/EdiromOnline'))
                                    then(expath:pkg-get-root('http://www.edirom.de/apps/EdiromOnline'))
                                    else();
declare variable $requestUrl := request:get-url();
declare variable $freidi-EO-url := substring-before($requestUrl,'apps/') || 'apps/' || substring-after($freidi-EO-root,'apps/');
declare variable $containingElements := ('sp','lg','l','p','stage','div');

let $doc := doc($collectionURI||$docName)
let $xslt := doc($config:app-root||'/data/xslt/getOccurenceDetail.xsl')
let $xslt2 := doc($config:app-root||'/data/xslt/markMatches.xsl')
 
 
return

element root {
    
    attribute collectionURI {$collectionURI},
    attribute docName {$docName},
    attribute topicID {$topicID},
    
    if($docName = 'FreiDi_TopicMap_Handbuch.xml') then(
        let $hit := doc($collectionURI||$docName)//id($topicID)
        let $hitsCount := count(doc($collectionURI||$docName)//id($topicID))
        return (
            attribute hits {$hitsCount},
            
            if($hitsCount > 0) then(
                
                element a {
                    attribute class {'btn btn-default'},
                    attribute data-toggle {'collapse'},
                    attribute href {concat('#collapse_',$doc//tei:TEI/@xml:id)},
                    attribute aria-expand {'false'},
                    attribute aria-controls {concat('#collapse_',$doc//tei:TEI/@xml:id)},
                    element span {
                        attribute class {'caret'},
                        fn:string(' ')
                    },
                    fn:normalize-space($doc//tei:teiHeader/tei:fileDesc/tei:titleStmt/tei:title[not(@type = 'desc')]),
                    string(' '),
                    element span {
                        attribute class {'badge'},
                        $hitsCount
                    }
                },
                element div {
                    attribute id {concat('collapse_',$doc//tei:TEI/@xml:id)},
                    attribute class {'collapse'},
                    
                    if($table = 'yes') then(
                        element table {
                            attribute class {'table table-striped table-hover table-responsive'},
                            for $hit at $i in $hit
                            (:let $context := $hit/ancestor::*[local-name()=('p','stage','div')][1]:)
                            (:let $summary := kwic:get-summary($context, $hit, <config width="{$truncate}" table="{$table}" link="http://www.freischuetz-digital.de/edition/"/>):)
                            return
                                element tr {
                                    element td {$i},
                                    element td {
                                        attribute class {'previous'}
                                    },
                                    element td {
                                        attribute class {'info'},
                                        element mark {
                                            $hit
                                        }
                                    },
                                    element td {
                                        attribute class {'following'}
                                    }
                                }
                        }
                    )else(
                        element ol {
                            for $hit at $i in $hit
                            (:let $context := $hit/ancestor::*[local-name()=('p','stage','div')][1]:)
                            (:let $summary := kwic:get-summary($context, $hit, <config width="{$truncate}" table="{$table}" link="http://www.freischuetz-digital.de/edition/"/>):)
                            return
                                element li {
                                    element span {
                                        attribute class {'previous'}
                                    },
                                    element mark {
                                        element a {
                                            attribute target {'_blank'},
                                            attribute class {}, (:http://rubin.upb.de:8092:)
                                        attribute href {$freidi-EO-url || '?uri=xmldb:exist://' || $collectionURI || $docName ||'#'|| $hit/parent::*/@xml:id}, 
                                            string($hit)
                                        }
                                    },
                                   element span{
                                       attribute class {'following'}
                                   }
                                }
                        }
                    )
                }
            ) else ()
        )

    )
    else(
        
        attribute hits {count(doc($collectionURI||$docName)//*[range:eq(@key, $topicID)])}, (:range:field-eq("key",$topicID):)
    
        for $hits in doc($collectionURI||$docName)[.//*[range:eq(@key, $topicID)]]
        let $withMatches := transform:transform($doc, $xslt2, <parameters><param name="topicID" value="{$topicID}"/></parameters>)
        (:  :let $matches := kwic:get-matches($hit)
        let $expanded := <exist:match>{$hit/range:field-eq("key",$topicID)}</exist:match>
        let $summarize := kwic:summarize($hit, <config width="40"/>)
        let $truncated := ''
        let $max := 40
        let $chars := '[...]'
        let $callback := ()
        order by ft:score($hit) descending:)
        
        return (
            element a {
                attribute class {'btn btn-default'},
                attribute data-toggle {'collapse'},
                attribute href {concat('#collapse_',$doc//tei:TEI/@xml:id)},
                attribute aria-expand {'false'},
                attribute aria-controls {concat('#collapse_',$doc//tei:TEI/@xml:id)},
                element span {
                    attribute class {'caret'},
                    fn:string(' ')
                },
                for $title in $doc//tei:teiHeader/tei:fileDesc/tei:titleStmt/tei:title[not(@type = ('desc','sub'))] return fn:normalize-space($title//text()),
                string(' '),
                element span {
                    attribute class {'badge'},
                    count(doc($collectionURI||$docName)//*[range:eq(@key, $topicID)])
                }
            },
            element div {
                attribute id {concat('collapse_',$doc//tei:TEI/@xml:id)},
                attribute class {'collapse'},
                
                if($table = 'yes') then(
                    element table {
                        attribute class {'table table-striped table-hover table-responsive'},
                        for $hit at $i in $withMatches//exist:match (:kwic:get-matches($withMatches):)
                        let $context := $hit/ancestor::*[local-name()=$containingElements][1]
                        let $summary := kwic:get-summary($context, $hit, <config width="{$truncate}" table="{$table}" link="http://www.freischuetz-digital.de/edition/"/>)
                        return
                            element tr {
                                element td {$i},
                                $summary//td[@class = 'previous'],
                                element td {(:TODO link to Edirom:)
                                    attribute class {'info'},
                                    element mark {
                                        element a {
                                            attribute target {'_blank'},
                                            $summary//a/@class, (: http://rubin.upb.de:8092 :)
                                            attribute href {'/exist/apps/EdiromOnline/?uri=xmldb:exist://' || $collectionURI || $docName ||'#'|| $hit/parent::*/@xml:id},
                                            string($hit)
                                        }
                                    }
                                },
                                $summary//td[@class = 'following']
                            }
                    }
                )else(
                    element ol {
                        for $hit at $i in $withMatches//exist:match (:kwic:get-matches($withMatches):)
                        let $expanded := util:expand($hit, "expand-xincluldes=no")
                        let $context := $hit/ancestor::*[local-name()=$containingElements][1]
                        let $summary := kwic:get-summary($context, $hit, <config width="{$truncate}" table="{$table}" link="http://www.freischuetz-digital.de/edition/"/>)
                        return
                            element li {
                                $summary//span[@class='previous'],
                                element mark {
                                    element a {
                                        attribute target {'_blank'},
                                        $summary//a/@class, (: http://rubin.upb.de:8092 :)
                                        attribute href {'/exist/apps/EdiromOnline/?uri=xmldb:exist://' || $collectionURI || $docName ||'#'|| $hit/parent::*/@xml:id}, string($hit)
                                    }
                                },
                                $summary//span[@class='following']
                            }
                    }
                )
            }
        )
    )
}