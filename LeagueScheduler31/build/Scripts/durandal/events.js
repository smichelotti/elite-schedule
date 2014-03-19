define(["durandal/system"],function(e){var t=/\s+/,n=function(){},i=function(e,t){this.owner=e,this.events=t};return i.prototype.then=function(e,t){return this.callback=e||this.callback,this.context=t||this.context,this.callback?(this.owner.on(this.events,this.callback,this.context),this):this},i.prototype.on=i.prototype.then,i.prototype.off=function(){return this.owner.off(this.events,this.callback,this.context),this},n.prototype.on=function(e,n,a){var r,o,s;if(n){for(r=this.callbacks||(this.callbacks={}),e=e.split(t);o=e.shift();)s=r[o]||(r[o]=[]),s.push(n,a);return this}return new i(this,e)},n.prototype.off=function(n,i,a){var r,o,s,c;if(!(o=this.callbacks))return this;if(!(n||i||a))return delete this.callbacks,this;for(n=n?n.split(t):e.keys(o);r=n.shift();)if((s=o[r])&&(i||a))for(c=s.length-2;c>=0;c-=2)i&&s[c]!==i||a&&s[c+1]!==a||s.splice(c,2);else delete o[r];return this},n.prototype.trigger=function(e){var n,i,a,r,o,s,c,l;if(!(i=this.callbacks))return this;for(l=[],e=e.split(t),r=1,o=arguments.length;o>r;r++)l[r-1]=arguments[r];for(;n=e.shift();){if((c=i.all)&&(c=c.slice()),(a=i[n])&&(a=a.slice()),a)for(r=0,o=a.length;o>r;r+=2)a[r].apply(a[r+1]||this,l);if(c)for(s=[n].concat(l),r=0,o=c.length;o>r;r+=2)c[r].apply(c[r+1]||this,s)}return this},n.prototype.proxy=function(e){var t=this;return function(n){t.trigger(e,n)}},n.includeIn=function(e){e.on=n.prototype.on,e.off=n.prototype.off,e.trigger=n.prototype.trigger,e.proxy=n.prototype.proxy},n});