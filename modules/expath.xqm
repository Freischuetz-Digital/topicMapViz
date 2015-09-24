xquery version "3.0";

(:~
 : A set of helper functions for expath-pkg testing
 : 
 :)

module namespace expath="http://expath.org/ns/pkg";

declare function expath:pkg-installed($pkg-name as xs:string){
    if(contains(repo:list(),$pkg-name))
    then(true())
    else(false())
};

declare function expath:pkg-get-root($pkg-name){
     for $pkg in collection(repo:get-root())//expath:package[@name = $pkg-name]
     return util:collection-name($pkg)||'/'
};
