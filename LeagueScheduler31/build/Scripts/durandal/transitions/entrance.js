define(["durandal/system","durandal/composition","jquery"],function(e,t,n){var i=100,r={marginRight:0,marginLeft:0,opacity:1},a={marginLeft:"",marginRight:"",opacity:"",display:""},o=function(t){return e.defer(function(e){function o(){e.resolve()}function s(){t.keepScrollPosition||n(document).scrollTop(0)}function c(){s(),t.triggerAttach();var e={marginLeft:l?"0":"20px",marginRight:l?"0":"-20px",opacity:0,display:"block"},i=n(t.child);i.css(e),i.animate(r,{duration:u,easing:"swing",always:function(){i.css(a),o()}})}if(t.child){var u=t.duration||500,l=!!t.fadeOnly;t.activeView?n(t.activeView).fadeOut({duration:i,always:c}):c()}else n(t.activeView).fadeOut(i,o)}).promise()};return o});