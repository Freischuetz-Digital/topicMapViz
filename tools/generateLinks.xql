xquery version "1.0";

declare namespace xtm="http://www.topicmaps.org/xtm/";

for $item in //xtm:topic/xtm:occurrence/xtm:resourceRef
return
  element pair{
    attribute type {'object'},
    attribute name {local-name($item)},
    element pair{
      attribute type {'string'},
      attribute name {'source'},
      $item/@href cast as xs:string
    },
    element pair{
      attribute type {'string'},
      attribute name {'target'},
      $item/parent::xtm:topic/@id
    },
    element pair{
      attribute type {'string'},
      attribute name {'type'},
      string('occurrence')
    }
  }
