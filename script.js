var audio = new Audio('cMove.mp3');


window.onkeydown = function(e) {
   if( e.keyCode == 38 ){
   		audio.play();//up
   }else if( e.keyCode == 40 ){
   		audio.play(); //down
   }
}