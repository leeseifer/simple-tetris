import { LightningElement } from 'lwc';
let pCanvas , context; //canvas and it context 2d
let playBoard = {};
let lastTime = 0;
let dropInterval = 1000;
let dropCounter = 0;
const player = {
    position : {x:0,y:0},
    matrix:null,
    score: 0
};


const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];
let IBlock = [
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0],
];

let LBlock = [
    [0,2,0],
    [0,2,0],
    [0,2,2],
];

let JBlock = [
    [0,3,0],
    [0,3,0],
    [3,3,0],
];

let OBlock = [
    [4,4],
    [4,4],
];

let ZBlock = [
    [5,5,0],
    [0,5,5],
    [0,0,0],
];

let SBlock = [
    [0,6,6],
    [6,6,0],
    [0,0,0],
];

let TBlock = [
    [0,7,0],
    [7,7,7],
    [0,0,0],
];
export default class SimpleTetris extends LightningElement {
    constructor(){
        super();
        document.addEventListener('keydown',this.handleKeyDown.bind(this));
    }
    renderedCallback(){
        pCanvas = this.template.querySelector('canvas');
        context = pCanvas.getContext('2d'); 
        context.scale(20,20);
        playBoard = this.createMatrix(12,20);
        this.resetPlayer();
        this.update();      
    }
    movePlayer(pos){
        player.position.x += pos;

        if(this.collide(playBoard,player)){
            player.position.x -= pos;
        }
    }

    rotatePlayer(d){
        const pos = player.position.x;
        let offset = 1;
        this.rotateMatrix(player.matrix,d);

        while(this.collide(playBoard,player)){
            player.position.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if(offset > player.matrix[0].length){
                this.rotateMatrix(player.matrix, -d);
                player.position.x = pos;
                return;
            }
        }

    }

    handleKeyDown(event){
        console.log(event.keyCode);
        if(event.keyCode === 37){ // left
            this.movePlayer(-1);
        } else if(event.keyCode === 39){// right
            this.movePlayer(1);
        } else if(event.keyCode === 40){// down
            this.dropPlayer();
        } else if(event.keyCode == 38){
            this.rotatePlayer(1);
        }
    }
    draw(){

        context.fillStyle = '#000';
        context.fillRect(0,0,pCanvas.width,pCanvas.height);
        
        this.drawMatrix(playBoard,{x:0,y:0});
        this.drawMatrix(player.matrix,player.position);
        //console.log(player.position.x, player.position.y);

    }

    mergeBlock(pb,p){
        p.matrix.forEach((row,y) =>{
            row.forEach((value,x) => {
                if(value !==0){
                    pb[y+p.position.y][x+p.position.x] = value;
                }
            });
        });
    }

    createMatrix(r,c){
        const matrix = [];
        while(c--){
            matrix.push(new Array(r).fill(0));
        }
        return matrix;
    }

    clearRow(){
        let rowC = 1;
        outer : for(let y = playBoard.length - 1; y > 0;--y){
            for (let x = 0;x < playBoard[y].length; ++x){
                if(playBoard[y][x] == 0){
                    continue outer;
                }
            }

            const row = playBoard.splice(y,1)[0].fill(0);
            playBoard.unshift(row);
            ++y;
            rowC *=2;
        }
    }

    drawMatrix(m,offset){
        m.forEach((row,y) => {
            row.forEach((value,x)=>{
                if(value !== 0){
                    context.fillStyle = colors[value];
                    context.fillRect(x+offset.x,
                                    y+offset.y,
                                    1,1);
                }
            });
        });
    }

    rotateMatrix(m,dir){
        for (let y = 0; y< m.length;++y){
            for(let x = 0; x < y; ++x){
                [m[x][y],m[y][x]]=[m[y][x],m[x][y]];
            }
        }

        if(dir > 0){
            m.forEach(row => row.reverse());
        }else{
            m.reverse;
        }
    }

    createBlocks(block){
        if(block === 'I'){
            return IBlock;
        }else if(block === 'L'){
            return LBlock;
        }else if (block === 'J'){
            return JBlock;
        }else if (block === 'O'){
            return OBlock;
        }else if (block === 'Z'){
            return ZBlock;
        }else if(block === 'S'){
            return SBlock;
        }else if(block === 'T'){
            return TBlock;
        }
    }

    resetPlayer(){
        const blocks = 'TJLOSZI';
        player.matrix = this.createBlocks(blocks[blocks.length * Math.random() | 0]);
        player.position.y = 0;
        player.position.x = (playBoard[0].length / 2 | 0) - (player.matrix[0].length/2 | 0);

        if(this.collide(playBoard,player)){
            playBoard.forEach(row => row.full(0));
            player.score = 0;
        }
    }

    dropPlayer(){
        player.position.y++;
        if(this.collide(playBoard,player)){
            player.position.y--;
            this.mergeBlock(playBoard,player);
            this.resetPlayer();
            this.clearRow();
        }
        dropCounter=0;
        
    }

    collide(playB,p){
        const m = p.matrix;
        const o = p.position;

        for (let y = 0 ; y<m.length;++y){
            for (let x = 0 ; x < m[y].length; ++x){
                if(m[y][x] !== 0 && 
                    (playB[y+o.y] && playB[y+o.y][x+o.x]) !== 0){
                        return true;
                    }
            }
        }

        return false;
    }

    update(time=0){
        const deltaTime = time-lastTime; 
        dropCounter += deltaTime;
        if(dropCounter > dropInterval){
            this.dropPlayer();
        }
        lastTime = time;
        this.draw();
        requestAnimationFrame((ts)=>{this.update(ts)});
    }
}