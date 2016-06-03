/**
 * Created by yishuangxi on 2015/11/17.
 */

(function (window, $) {
    if (window.Tetris) {
        return;
    }
    var Brick = window.Brick;//该文件依赖于Brick函数
    var active_cls = 'block', deactive_cls = '';
    function Tetris($container, config){
        var defaults = {
            columns: 10,
            rows: 14,
            height: 30,
            width: 30
        }
        this.$container = $container;
        this.config = $.extend({}, defaults, config);
        this.data = [];
        this._init();
    }
    
    Tetris.prototype._init = function(){
        this._initHtml();
        this._cacheGrids();
        this._initData();
        this.render();
        this._bindEvents();
    };
    
    Tetris.prototype._initData = function(){
        for(var row = 0; row < this.config.rows; row++){
            var row_data = [];
            for(var column = 0; column < this.config.columns; column++){
                row_data.push(deactive_cls);  
            }
            this.data.push(row_data);
        }  
    }
    
    Tetris.prototype._initHtml = function () {
        var blocks_arr = [];
        for (var r = 0; r < this.config.rows; r++) {
            var rows = [];
            for (var c = 0; c < this.config.columns; c++) {
                rows.push('<td id="id_' + c + '_' + r + '" class="grid" style="height:' + this.config.height + 'px;width:' + this.config.width + 'px"></td>');
            }
            blocks_arr.push('<tr class="row">' + rows.join('') + '</tr>');
        }
        var table = $('<table>' + blocks_arr.join('') + '</table>');
        this.$container.append(table);
    }
    
    Tetris.prototype._bindEvents = function(){
        var self = this;
        var KEY_UP = 38, KEY_DOWN = 40, KEY_LEFT = 37, KEY_RIGHT = 39;
        $(document).keydown(function (event) {
            if (!self.brick) return;

            if (event.which === KEY_UP) {
                if(self.isBrickRotateOutBound(self.brick)) return;
                self.brick.rotate();
            } else if (event.which === KEY_DOWN) {
                if (self.isBrickBorderOutBound(Brick.directions.DOWN)) {
                    self.rerender();
                    return;
                };
                self.brick.move(Brick.directions.DOWN);
            } else if (event.which === KEY_LEFT) {
                if (self.isBrickBorderOutBound(Brick.directions.LEFT)) return;
                self.brick.move(Brick.directions.LEFT);
            } else if (event.which === KEY_RIGHT) {
                if (self.isBrickBorderOutBound(Brick.directions.RIGHT)) return;
                self.brick.move(Brick.directions.RIGHT);
            } else {

            }
        });   
    }
    
    Tetris.prototype._cacheGrids = function(){
        this.grids = [];
        for(var row = 0; row < this.config.rows; row++){
            var row_grids = [];
            for(var column = 0; column < this.config.columns; column++){
                row_grids.push($('#id_'+column+'_'+row));
            }
            this.grids.push(row_grids);
        }
    }
    
    Tetris.prototype.render = function(){
        var data = this.data;
        var grids = this.grids;
        for(var row = 0; row < data.length; row++){
            for(var column = 0; column < data[row].length; column++){
                if(data[row][column] === active_cls){
                    grids[row][column].addClass(active_cls);    
                }else{
                    grids[row][column].removeClass(active_cls);
                }
            }    
        }
    };
    
    Tetris.prototype._updateData = function(){
        var absCoordinates = this.brick.getAbsCoordinates();
        for(var i = 0; i < absCoordinates.length; i++){
            var x = absCoordinates[i].x, y = absCoordinates[i].y;
            this.data[y][x] = active_cls;
        }
        
        for(var i = 0, len = this.data.length; i < len; i++){
            var thisRow = this.data[i];
            var isThisRowFull = true;
            for(var k = 0; k < thisRow.length; k++){
                if(thisRow[k] !== active_cls){
                    isThisRowFull = false;
                    break;
                }
            }
            if(isThisRowFull){
                this.data.splice(i, 1);
                this.data.unshift(this._getBlankNewRow());
            }
        }
    };
    Tetris.prototype.rerender = function(){
        this._updateData();
        this.brick = null;
        this.render();
    };
    
    Tetris.prototype._getBlankNewRow = function(){
        var new_row = [];
        for(var m = 0; m < this.config.columns; m++){
            new_row.push(deactive_cls);
        }
        return new_row;
    };
    
    Tetris.prototype.start = function(){
        var self = this;
        setInterval(function(){
            if(!self.brick){
                var type = self.randomBrickType(), status = self.randomBrickStatus();
                console.log('type: ', type, ' status: ', status);
                self.brick = new Brick({type: type, status: status});
                self.brick.render({x: (self.config.columns - 4) / 2, y: -4});
            }
            if(self.isBrickBorderOutBound(Brick.directions.DOWN)){
                self.rerender();
            }else{
                self.brick.move(Brick.directions.DOWN);
            }
            
        }, 1000);        
    }
    //判断是否已经到左/右/下/边界或者左右下已经有brick挡住了
    Tetris.prototype.isBrickBorderOutBound = function (direction) {
        var brick = this.brick;
        var absCoordinates = brick.getAbsCoordinates();
        var cloneAbsCoordinates = $.extend(true, [], absCoordinates);
        //首先判断左边是否已经超出边界
        if (direction === Brick.directions.LEFT) {
            //选出Brick中所有最左边的block坐标:每一个坐标都和前面所有的坐标挨个比较,如果有y值相同的,则比较其x值,删除x值较大(更靠右边)的那个坐标
            for (var i = 1; i < cloneAbsCoordinates.length; i++) {
                for (var k = 0; k < i; k++) {
                    if (cloneAbsCoordinates[k].y === cloneAbsCoordinates[i].y) {
                        if (cloneAbsCoordinates[k].x > cloneAbsCoordinates[i].x) {
                            cloneAbsCoordinates.splice(k, 1);
                        } else {
                            cloneAbsCoordinates.splice(i, 1);
                        }
                        //因为删除了一个元素,所以要把i值往回走一个位置
                        i--;
                    }
                }

            }
            for (var i = 0; i < cloneAbsCoordinates.length; i++) {
                var leftX = cloneAbsCoordinates[i].x - 1;
                if (leftX < 0 || $('#id_' + leftX + '_' + cloneAbsCoordinates[i].y).hasClass(active_cls)) {
                    return true;
                }
            }
        }
        else if (direction === Brick.directions.RIGHT) {
            //选出Brick中所有最右边的block坐标:每一个坐标都和前面所有的坐标挨个比较,如果有y值相同的,则比较其x值,删除x值较小(更靠左边)的那个坐标
            for (var i = 1; i < cloneAbsCoordinates.length; i++) {
                for (var k = 0; k < i; k++) {
                    if (cloneAbsCoordinates[k].y === cloneAbsCoordinates[i].y) {
                        if (cloneAbsCoordinates[k].x < cloneAbsCoordinates[i].x) {
                            cloneAbsCoordinates.splice(k, 1);
                        } else {
                            cloneAbsCoordinates.splice(i, 1);
                        }
                        //因为删除了一个元素,所以要把i值往回走一个位置
                        i--;
                    }
                }

            }
            for (var i = 0; i < cloneAbsCoordinates.length; i++) {
                var rightX = cloneAbsCoordinates[i].x + 1;
                if (rightX > (this.config.columns - 1) || $('#id_' + rightX + '_' + cloneAbsCoordinates[i].y).hasClass(active_cls)) {
                    return true;
                }
            }
        }
        else if (direction === Brick.directions.DOWN) {
            //选出Brick中所有最下边的block坐标:每一个坐标都和前面所有的坐标挨个比较,如果有x值相同的,则比较其y值,删除y值较小(更靠上边)的那个坐标
            for (var i = 1; i < cloneAbsCoordinates.length; i++) {
                for (var k = 0; k < i; k++) {
                    if (cloneAbsCoordinates[k].x === cloneAbsCoordinates[i].x) {
                        if (cloneAbsCoordinates[k].y < cloneAbsCoordinates[i].y) {
                            cloneAbsCoordinates.splice(k, 1);
                        } else {
                            cloneAbsCoordinates.splice(i, 1);
                        }
                        //因为删除了一个元素,所以要把i值往回走一个位置
                        i--;
                    }
                }

            }
            for (var i = 0; i < cloneAbsCoordinates.length; i++) {
                var downY = cloneAbsCoordinates[i].y + 1;
                if (downY > (this.config.rows - 1)||$('#id_' + cloneAbsCoordinates[i].x + '_' + downY).hasClass(active_cls)) {
                    return true;
                }
            }
        }

        return false;
    };
    
    //判断是否旋转出界
    Tetris.prototype.isBrickRotateOutBound = function(brick){
        if(brick.type === Brick.types.I){
            return this.isBrickRotateOutBoundI();
        }
        else if(brick.type === Brick.types.J){
            return this.isBrickRotateOutBoundJ();
        }
        else if(brick.type === Brick.types.L){
            return this.isBrickRotateOutBoundL();
        }
        else if(brick.type === Brick.types.S){
            return this.isBrickRotateOutBoundS();
        }
        else if(brick.type === Brick.types.Z){
            return this.isBrickRotateOutBoundZ();
        }else if(brick.type === Brick.types.T){
            return this.isBrickRotateOutBoundT();
        }
        else if(brick.type === Brick.types.O){
            return this.isBrickRotateOutBoundO();
        }
        else{
            
        }
        

        return false;
    };
    
    Tetris.prototype.randomBrickType = function(){
        return getRandomInt(0, 6);    
    };
    Tetris.prototype.randomBrickStatus = function(){
        return getRandomInt(0, 3);
    };
    
    Tetris.prototype.isBrickRotateOutBoundI = function(){
        var brick = this.brick;
        var absCoordinates = brick.getAbsCoordinates();
        var leftBorderIndex = 0,
            rightBorderIndex = this.config.columns - 1,
            downBorderIndex = this.config.rows - 1;
        if(brick.status === Brick.status.A || brick.status === Brick.status.C ){
            var center = absCoordinates[2];
            //如果旋转之后左右两边越界了,则不执行旋转操作
            if ((center.x - 1) < leftBorderIndex || (center.x + 1) > rightBorderIndex || (center.x + 2) > rightBorderIndex) return true;
            //如果旋转时有block挡住了,也不执行旋转操作
            for(var y = 0; y < 2; y++){
                // if($('#id_' + (center.x - 1) + '_' + (center.y + y)).hasClass('block')) return true;
                if(this.grids[center.y+y][center.x - 1].hasClass('block')) return true;
            }
            for(var x = 1; x < 3; x++){
                for(var y = 0; y < 3; y++){
                    // if($('#id_' + (center.x+x) + '_' + (center.y - y)).hasClass('block')) return true;
                    if(this.grids[center.y + y][center.x + x].hasClass('block')) return true;
                }
            }
        }else if(brick.status === Brick.status.B || brick.status === Brick.status.D ){
            var center = absCoordinates[1];
            //如果旋转之后下边越界了,或者下一个空位已经有block占位了,则不执行旋转操作
            // if ((center.y + 1) > downBorderIndex || $('#id_' + center.x + '_' + (center.y + 1)).hasClass('block')) return true;
            if ((center.y + 1) > downBorderIndex || this.grids[center.y+1][center.x].hasClass('block')) return true;
        }
        
        return false;
    };
    
    Tetris.prototype.isBrickRotateOutBoundJ = function(){
        var brick = this.brick;
        var absCoordinates = brick.getAbsCoordinates();
        var leftBorderIndex = 0,
            rightBorderIndex = this.config.columns - 1,
            downBorderIndex = this.config.rows - 1;
            
        if(brick.status === Brick.status.A){
            var center = absCoordinates[1];
            if((center.x+1) > rightBorderIndex) return true;
            if(this.grids[center.y][center.x - 1].hasClass(active_cls)) return true;
            for(var y = center.y - 1; y <= center.y; y++ ){
                if(this.grids[y][center.x+1].hasClass(active_cls)) return true;   
            }
        }else if(brick.status === Brick.status.B){
            var center = absCoordinates[2];
            if((center.y+1) > (this.config.rows - 1)) return true;
            if(this.grids[center.y - 1][center.x].hasClass(active_cls) ) return true;
            for(var x = center.x; x<=center.x+1; x++){
                if(this.grids[center.y+1][x].hasClass(active_cls)) return true;
            }
        }else if(brick.status === Brick.status.C){
            var center = absCoordinates[2];
            if((center.x - 1) < leftBorderIndex) return true;
            if(this.grids[center.y][center.x + 1].hasClass(active_cls)) return true;
            for(var y = center.y; y <= center.y+1; y++){
                if(this.grids[y][center.x - 1].hasClass(active_cls)) return true;
            }
        }else if(brick.status === Brick.status.D){
            var center = absCoordinates[1];
            if(this.grids[center.y+1][center.x].hasClass(active_cls)) return true;
            for(var x = center.x - 1; x<= center.x+1; x++){
                if(this.grids[center.y - 1][x].hasClass(active_cls)) return true;
            }
        }
        
        return false;
    };
    Tetris.prototype.isBrickRotateOutBoundL = function(){
        var brick = this.brick;
        var absCoordinates = brick.getAbsCoordinates();
        var leftBorderIndex = 0,
            rightBorderIndex = this.config.columns - 1,
            downBorderIndex = this.config.rows - 1;
        
        if(brick.status === Brick.status.A){
            var center = absCoordinates[1];
            if((center.x - 1) < leftBorderIndex ) return true;
            for(var y = center.y - 1; y<=center.y;y++){
                if(this.grids[y][center.x+1].hasClass(active_cls)) return true;
            }
            for(var y = center.y; y <= center.y + 1; y++ ){
                if(this.grids[y][center.x-1].hasClass(active_cls)) return true; 
            }
        }else if(brick.status === Brick.status.B){
            var center = absCoordinates[1];
            
            for(var x = center.x - 1; x<=center.x; x++){
                if(this.grids[center.y-1][x].hasClass(active_cls)) return true;
            }
            for(var x = center.x; x<=center.x+1; x++){
                if( this.grids[center.y+1][x].hasClass(active_cls)) return true;
            }
        }else if(brick.status === Brick.status.C){
            var center = absCoordinates[2];
            if((center.x + 1) > rightBorderIndex) return true;
            for(var y = center.y - 1; y <= center.y; y++){
                if(this.grids[y][center.x+1].hasClass(active_cls)) return true;
            }
            for(var y = center.y; y <= center.y+1; y++){
                if(this.grids[y][center.x - 1].hasClass(active_cls)) return true;
            }
        }else if(brick.status === Brick.status.D){
            var center = absCoordinates[2];
            if((center.y+1) > downBorderIndex) return true;
            for(var x = center.x - 1; x<= center.x; x++){
                if(this.grids[center.y - 1][x].hasClass(active_cls)) return true;
            }
            for(var x = center.x; x<= center.x+1; x++){
                if(this.grids[center.y+1][x].hasClass(active_cls)) return true;
            }
        }
        
        return false;
    };
    Tetris.prototype.isBrickRotateOutBoundS = function(){
        var brick = this.brick;
        var absCoordinates = brick.getAbsCoordinates();
        var leftBorderIndex = 0,
            rightBorderIndex = this.config.columns - 1,
            downBorderIndex = this.config.rows - 1;
            
        if(brick.status === Brick.status.A || brick.status === Brick.status.C){
            var center = absCoordinates[3];
            if((center.y+1) > downBorderIndex) return true;
            if(this.grids[center.y-1][center.x-1].hasClass(active_cls)) return true;
            if(this.grids[center.y][center.x+1].hasClass(active_cls) || this.grids[center.y+1][center.x+1].hasClass(active_cls)) return true;
        }
        else if(brick.status === Brick.status.B || brick.status === Brick.status.D){
            var center = absCoordinates[1];
            if((center.x+1)>rightBorderIndex) return true;
            if(this.grids[center.y-1][center.x+1].hasClass(active_cls)) return true;
            if(this.grids[center.y-1][center.x-1].hasClass(active_cls) || this.grids[center.y][center.x-1].hasClass(active_cls)) return true;
        }
        return false;    
    };
    Tetris.prototype.isBrickRotateOutBoundZ = function(){
        var brick = this.brick;
        var absCoordinates = brick.getAbsCoordinates();
        var leftBorderIndex = 0,
            rightBorderIndex = this.config.columns - 1,
            downBorderIndex = this.config.rows - 1;
        if(brick.status === Brick.status.A || brick.status === Brick.status.C){
            var center = absCoordinates[2];
            if((center.y+1) > downBorderIndex) return true;
            if(this.grids[center.y-1][center.x+1].hasClass(active_cls)) return true;
            if(this.grids[center.y+1][center.x].hasClass(active_cls) || this.grids[center.y+1][center.x+1].hasClass(active_cls)) return true;
        }
        else if(brick.status === Brick.status.B || brick.status === Brick.status.D){
            var center = absCoordinates[1];
            if((center.x-1) < leftBorderIndex) return true;
            if(this.grids[center.y+1][center.x+1].hasClass(active_cls)) return true;
            if(this.grids[center.y-1][center.x-1].hasClass(active_cls) || this.grids[center.y-1][center.x].hasClass(active_cls)) return true;
        }
        return false; 
    };
    Tetris.prototype.isBrickRotateOutBoundT = function(){
         var brick = this.brick;
        var absCoordinates = brick.getAbsCoordinates();
        var leftBorderIndex = 0,
            rightBorderIndex = this.config.columns - 1,
            downBorderIndex = this.config.rows - 1;
        if(brick.status === Brick.status.A){
            var center = absCoordinates[1];
            if(this.grids[center.y+1][center.x+1].hasClass(active_cls)) return true;
            if(this.grids[center.y+1][center.x - 1].hasClass(active_cls)) return true;
            if(this.grids[center.y-1][center.x - 1].hasClass(active_cls) || this.grids[center.y - 1][center.x].hasClass(active_cls)) return true;
        }
        else if(brick.status === Brick.status.B){
            var center = absCoordinates[2];
            if((center.x+1)>rightBorderIndex) return true;
            if(this.grids[center.y - 1][center.x-1].hasClass(active_cls)) return true;
            if(this.grids[center.y-1][center.x+1].hasClass(active_cls) || this.grids[center.y][center.x+1].hasClass(active_cls)) return true;
            if(this.grids[center.y+1][center.x-1].hasClass(active_cls)) return true;
        }
        else if(brick.status === Brick.status.C){
            var center = absCoordinates[2];
            if((center.y+1)>downBorderIndex) return true;
            if(this.grids[center.y-1][center.x-1].hasClass(active_cls)) return true;
            if(this.grids[center.y-1][center.x + 1].hasClass(active_cls)) return true;
            if(this.grids[center.y+1][center.x].hasClass(active_cls) || this.grids[center.y + 1][center.x+1].hasClass(active_cls)) return true;
        }
        else if(brick.status === Brick.status.D){
            var center = absCoordinates[1];
            if((center.x-1)<leftBorderIndex) return true;
            if(this.grids[center.y-1][center.x+1].hasClass(active_cls)) return true;
            if(this.grids[center.y+1][center.x + 1].hasClass(active_cls)) return true;
            if(this.grids[center.y][center.x - 1].hasClass(active_cls) || this.grids[center.y+1][center.x-1].hasClass(active_cls)) return true;
        }
        return false;
    };
    Tetris.prototype.isBrickRotateOutBoundO = function(){
        return false; 
    };
    
    function getRandomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    window.Tetris = Tetris;
})(window, jQuery);