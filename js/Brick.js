/**
 * Created by yishuangxi on 2015/11/20.
 */
(function (window, $) {
    //Brick常量配置
    Brick.types = {I: 0, J: 1, L: 2, O: 3, S: 4, Z: 5, T: 6};
    Brick.status = {A: 0, B: 1, C: 2, D: 3};
    Brick.directions = {DOWN: 0, LEFT: 1, UP: 2, RIGHT: 3};

    //Brick构造函数
    function Brick(config) {
        var defaults = {
            type: Brick.types.I,
            status: Brick.status.A
        };
        var config = $.extend({}, defaults, config);
        this.type = config.type;
        this.status = config.status;
        this.position = {};//position用于缓存Brick的坐标位置参数，在Brick调用render方法的时候传入
        this.blocks = [];//用于缓存当前blocks，如要获取最新的blocks，调用this._getBlocks方法
    }

    //Brick对外接口
    //Brick移动：左右下3个方向
    Brick.prototype.move = function (direction, callback) {
        var direction = direction || Brick.directions.DOWN;
        var callback = callback || function(){};

        if (direction === Brick.directions.LEFT) {
            this.position.x -= 1;
        } else if (direction === Brick.directions.RIGHT) {
            this.position.x += 1;
        } else if (direction === Brick.directions.DOWN) {
            this.position.y += 1;
        } else {
            this.position.y += 1;
        }
        this.render();
    };

    //Brick旋转
    Brick.prototype.rotate = function () {
        this.status = (this.status + 1) % 4;
        this.render();
    };

    //Brick私有接口：方法名前面加了下划线的全部是私有方法，不建议外部直接使用
    //Brick渲染方法
    Brick.prototype.render = function (position) {
        //渲染之前，干掉原来渲染过的blocks
        for (var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].removeClass('block');
        }
        //更新position:如果外部传入了position，则优先使用外部position，否则还是使用原来的position
        this.position = position || this.position;
        
        var blocks = this._getBlocks();
        //把blocks缓存起来
        this.blocks = blocks;
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].addClass('block');
        }
    };
    //获取blocks的绝对坐标集
    Brick.prototype.getAbsCoordinates = function () {
        var absCoordinates = [];
        var relCoordinates = this._getRelCoordinates();
        var position = this.position;
        for (var i = 0; i < relCoordinates.length; i++) {
            absCoordinates.push({
                x: position.x + relCoordinates[i].x,
                y: position.y + relCoordinates[i].y
            });
        }
        return absCoordinates;
    };
    //获取blocks的相对坐标集
    Brick.prototype._getRelCoordinates = function () {
        var coordinates;
        if (this.type === Brick.types.I) {
            coordinates = this._getRelCoordinatesI();
        }else if(this.type === Brick.types.J){
            coordinates = this._getRelCoordinatesJ();
        }else if(this.type === Brick.types.L){
            coordinates = this._getRelCoordinatesL();
        }else if(this.type === Brick.types.S){
            coordinates = this._getRelCoordinatesS();
        }else if(this.type === Brick.types.Z){
            coordinates = this._getRelCoordinatesZ();
        }else if(this.type === Brick.types.T){
            coordinates = this._getRelCoordinatesT();
        }else if(this.type === Brick.types.O){
            coordinates = this._getRelCoordinatesO();
        }else {
            throw Error('Type '+ this.type + ' is not exsits!');
        }
        return coordinates;
    };
    //获取所有的blocks集
    Brick.prototype._getBlocks = function () {
        var blocks = [];
        var absCoordinates = this.getAbsCoordinates();
        for (var i = 0; i < absCoordinates.length; i++) {
            blocks.push($('#id_' + absCoordinates[i].x + '_' + absCoordinates[i].y));
        }
        return blocks;
    };
    
    // //渲染I
    // Brick.prototype._renderI = function () {
    //     var blocks = this._getBlocks();
    //     for (var i = 0; i < blocks.length; i++) {
    //         blocks[i].addClass('block');
    //     }
    //     //把blocks缓存起来
    //     this.blocks = blocks;
    // };
    
    // Brick.prototype._renderJ = function(){
    //     var blocks = this._getBlocks();
    // };
    //坐标以最大的4*4的16宫格为准，初始化一个Brick，以该Brick的变形的位置参考初始化各种状态
    //获取I类Brick的block的相对坐标集
    Brick.prototype._getRelCoordinatesI = function () {
        var coordinates;
        if (this.status === Brick.status.A || this.status === Brick.status.C) {
            coordinates = [{x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}];
        } else if (this.status === Brick.status.B || this.status === Brick.status.D) {
            coordinates = [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}];
        }
        return coordinates;
    };
    Brick.prototype._getRelCoordinatesJ = function(){
        var coordinates;
        if(this.status === Brick.status.A){
            coordinates = [{x:1, y:1}, {x:1, y:2}, {x:1, y:3}, {x:0, y:3}];
        }else if(this.status === Brick.status.B){
            coordinates = [{x:0, y:1}, {x:0, y:2}, {x:1, y:2}, {x:2, y:2}];
        }else if(this.status === Brick.status.C){
            coordinates = [{x:1, y:1}, {x:2, y:1}, {x:1, y:2}, {x:1, y:3}];
        }else if(this.status === Brick.status.D){
            coordinates = [{x:0, y:2}, {x:1, y:2}, {x:2, y:2}, {x:2, y:3}];
        }else {
            coordinates = [{x:1, y:1}, {x:1, y:2}, {x:1, y:3}, {x:0, y:3}];
        }
        
        return coordinates;
    };
    Brick.prototype._getRelCoordinatesL = function(){
        var coordinates;
        if(this.status === Brick.status.A){
            coordinates = [{x:1, y:1}, {x:1, y:2}, {x:1, y:3}, {x:2, y:3}];
        }else if(this.status === Brick.status.B){
            coordinates = [{x:0, y:2}, {x:1, y:2}, {x:2, y:2}, {x:0, y:3}];
        }else if(this.status === Brick.status.C){
            coordinates = [{x:0, y:1}, {x:1, y:1}, {x:1, y:2}, {x:1, y:3}];
        }else if(this.status === Brick.status.D){
            coordinates = [{x:2, y:1}, {x:0, y:2}, {x:1, y:2}, {x:2, y:2}];
        }else {
            coordinates = [{x:1, y:1}, {x:1, y:2}, {x:1, y:3}, {x:2, y:3}];
        }
        
        return coordinates;
    };
    Brick.prototype._getRelCoordinatesS = function(){
        var coordinates;
        if(this.status === Brick.status.A || this.status === Brick.status.C){
            coordinates = [{x:1, y:1}, {x:2, y:1}, {x:0, y:2}, {x:1, y:2}];
        }else if(this.status === Brick.status.B || this.status === Brick.status.D){
            coordinates = [{x:1, y:1}, {x:1, y:2}, {x:2, y:2}, {x:2, y:3}];
        }else {
            coordinates = [{x:1, y:1}, {x:2, y:1}, {x:0, y:2}, {x:1, y:2}];
        }
        
        return coordinates;
    };
    
    Brick.prototype._getRelCoordinatesZ = function(){
        var coordinates;
        if(this.status === Brick.status.A || this.status === Brick.status.C){
            coordinates = [{x:0, y:1}, {x:1, y:1}, {x:1, y:2}, {x:2, y:2}];
        }else if(this.status === Brick.status.B || this.status === Brick.status.D){
            coordinates = [{x:2, y:1}, {x:1, y:2}, {x:2, y:2}, {x:1, y:3}];
        }else {
            coordinates = [{x:0, y:1}, {x:1, y:1}, {x:1, y:2}, {x:2, y:2}];
        }
        
        return coordinates;
    };
    
    Brick.prototype._getRelCoordinatesT = function(){
        var coordinates;
        if(this.status === Brick.status.A){
            coordinates = [{x:0, y:2}, {x:1, y:2}, {x:2, y:2}, {x:1, y:3}];
        }else if(this.status === Brick.status.B){
            coordinates = [{x:1, y:1}, {x:0, y:2}, {x:1, y:2}, {x:1, y:3}];
        }else if(this.status === Brick.status.C){
            coordinates = [{x:1, y:1}, {x:0, y:2}, {x:1, y:2}, {x:2, y:2}];
        }else if(this.status === Brick.status.D){
            coordinates = [{x:1, y:1}, {x:1, y:2}, {x:2, y:2}, {x:1, y:3}];
        }else {
            coordinates = [{x:0, y:2}, {x:1, y:2}, {x:2, y:2}, {x:1, y:3}];
        }
        
        return coordinates;
    };
    
    Brick.prototype._getRelCoordinatesO = function(){
        var coordinates = [{x:0, y:2}, {x:1, y:2}, {x:0, y:3}, {x:1, y:3}];
        return coordinates;
    };
    
    window.Brick = Brick;
})(window, jQuery);