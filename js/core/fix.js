/* OPJ Elite — Display Fix Robust v4
 * Override CSSStyleDeclaration.prototype.display
 * Utilise WeakMap pour mapping rapide style -> elementId
 */
!function(){
  'use strict';
  var styleMap = new WeakMap();
  var FLEX = new Set(['app','p-home','p-lecons','p-revision','p-examen','p-profil']);
  
  // Pré-calculer la map après DOM ready
  function buildMap(){
    FLEX.forEach(function(id){
      var el = document.getElementById(id);
      if(el) styleMap.set(el.style, id);
    });
  }
  // Construire maintenant si DOM prêt, sinon attendre
  if(document.readyState !== 'loading') buildMap();
  else document.addEventListener('DOMContentLoaded', buildMap);
  // Reconstruire aussi après chaque navigation (au cas où)
  setTimeout(buildMap, 500);
  setTimeout(buildMap, 1500);
  
  var orig = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,'display');
  if(!orig || !orig.set) return;
  
  Object.defineProperty(CSSStyleDeclaration.prototype,'display',{
    get: orig.get,
    set: function(v){
      if(v==='block'){
        var id = styleMap.get(this);
        if(id){
          orig.set.call(this,'flex');
          this.flexDirection = 'column';
          if(id !== 'app'){
            this.flex = '1';
            this.overflowY = 'auto';
          } else {
            this.minHeight = '100dvh';
            // Afficher bnav
            var bn = document.getElementById('bnav');
            if(bn && bn.style.display === 'none') bn.style.display = 'flex';
          }
          return;
        }
      }
      orig.set.call(this, v);
    },
    configurable: true
  });
  
  // Aussi: corriger bnav via MutationObserver sur #app
  var appEl = document.getElementById('app');
  if(appEl){
    new MutationObserver(function(){
      if(appEl.style.display !== 'none' && appEl.style.display !== ''){
        var bnav = document.getElementById('bnav');
        if(bnav && bnav.style.display === 'none') bnav.style.display = 'flex';
      }
    }).observe(appEl,{attributes:true,attributeFilter:['style']});
  }
  
  console.log('[OPJ] Fix display v4 actif');
}();
