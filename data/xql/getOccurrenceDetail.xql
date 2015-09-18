xquery version "3.0";

import module namespace config="http://www.freischuetz-digital.de/topicMapViz/config" at "../../modules/config.xqm";
import module namespace freidi-tmv="http://www.freischuetz-digital.de/topicMapViz/app" at "../../modules/app.xql";
import module namespace kwic="http://exist-db.org/xquery/kwic";

declare namespace tei = "http://www.tei-c.org/ns/1.0";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";
(: declare option exist:serialize "method=text media-type=text/plain omit-xml-declaration=yes"; :)


declare variable $href := request:get-parameter('href','freidi-librettoSource_KA-tx4.xml#agathe');
declare variable $docName := substring-before($href, '#');
declare variable $topicID := substring-after($href, '#');
declare variable $collectionURI := if(contains($docName, 'librettoSource'))then('/db/contents/texts/')else($freidi-tmv:text-root);
declare variable $table :=request:get-parameter('table', 'no');
declare variable $truncate :=request:get-parameter('truncate', '60');

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
                                            attribute class {},
                                            attribute href {'http://www.freischuetz-digital.de/edition/'},
                                            $hit
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
                fn:normalize-space($doc//tei:teiHeader/tei:fileDesc/tei:titleStmt/tei:title[not(@type = 'desc')]),
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
                        for $hit at $i in kwic:get-matches($withMatches)
                        let $context := $hit/ancestor::*[local-name()=('p','stage','div')][1]
                        let $summary := kwic:get-summary($context, $hit, <config width="{$truncate}" table="{$table}" link="http://www.freischuetz-digital.de/edition/"/>)
                        return
                            element tr {
                                element td {$i},
                                $summary//td[@class = 'previous'],
                                element td {
                                    attribute class {'info'},
                                    element mark {
                                        $summary//td[@class = 'hi']/node()
                                    }
                                },
                                $summary//td[@class = 'following']
                            }
                    }
                )else(
                    element ol {
                        for $hit at $i in $withMatches//exist:match (:kwic:get-matches($withMatches):)
                        let $expanded := util:expand($hit, "expand-xincludes=no")
                        let $context := $hit/ancestor::*[local-name()=('sp','lg','l','p','stage','div')][1]
                        let $summary := kwic:get-summary($context, $hit, <config width="{$truncate}" table="{$table}" link="http://www.freischuetz-digital.de/edition/"/>)
                        return
                            element li {
                                $summary//span[@class='previous'],
                                element mark {
                                    element a {
                                        attribute target {'_blank'},
                                        $summary//a/@class,
                                        $summary//a/@href,
                                        $summary//a/node()
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