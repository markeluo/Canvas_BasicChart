/**
 * Created by wanli on 2015/3/25.
 */
function WLChart(_options){
    var self=this;
    var defaults = {
        container:"",
        type:"line",//类型,line/spline/area/column
        border:{
            width:1,
            color:"#dcdcdc"
        },//边框
        backgroundcolor:"#ffffff",
        padding:{
            left:80,
            right:20,
            top:20,
            bottom:60
        },
        linewidth:0.5,//线条宽度
        linecolor:"#28c4a5",//线条颜色
        fillcolor:"green",//填充颜色(面积图区域颜色、柱状图柱子颜色)
        marker:{
            label:{
                enabled:true,
                fontcolor:"#666666",
                fontsty:"6px Arial"
            },
            color:"#3aa15a",
            border:{
                color:"#28c4a5",
                width:1
            }
        },//marker点标记
        minmax:null,//X,Y最小最大值
        xasix:{
            xtype:"string",//y轴类型
            tickinterval:3,//刻度间隔
            linecolor:"#000000",
            linewidth:1,
            tickcolor:"#666666",//刻度颜色
            ticklength:5,
            tickwidth:1,
            label:{
                fontcolor:"#666666",
                fontsty:"6px Arial",
                float:0
            },
            gridline:{
                color:"#dcdcdc",
                width:1,
                style:"solid"
            },
            items:null
        },//x轴设置
        yasix:{
            tickcolor:"#666666",//刻度颜色
            ticklength:5,
            tickwidth:1,
            linecolor:"#000000",
            linewidth:1,
            label:{
                fontcolor:"#666666",
                fontsty:"6px Arial",
                float:2
            },
            gridline:{
                color:"#dcdcdc",
                width:1,
                style:"solid"
            },
            items:null
        },//y轴设置
        tooltips:{
            border:{
                width:1,
                color:"#f08217"
            },
            backgroundcolor:"#ffffff",
            fontsty:"6px Arial",
            color:"#666666"
        },
        standline:{
            ucl:[],//item:{name:"",value:"",color:""}
            lcl:[]
        },//标准线
        data:getdemodata()//默认demo数据
    };
    self.options= mergeObject(defaults, _options);
    //刷新显示
    self.Refresh=function(){
        var container=self.options.container;
        if(typeof(container)=="string"){
            container=$("#"+container);
        }
        self.options.container=container;
        container.css({"position":"relative"});

        //添加canvas 画布
        var canvasid=container[0].id+"_chart";
        var tempcanvas=$("<canvas id='"+canvasid+"'></canvas>").attr({
            "width":container.width()+"px",
            "height":container.height()+"px"
        }).css({
            "position":"absolute",
            "left":"0px",
            "top":"0px"
        }).appendTo(container);

        //region 事件处理
        tempcanvas.bind("mousemove",function(ev){
            self.ShowToolTips(this,ev);
        });
        tempcanvas.bind("mouseout",function(ev){
            self.ShowToolTips(this,ev);
        })
        //endregion

        //图形canvas对象
        tempcanvas=document.getElementById(canvasid);
        self.options.minmax=getasixminmax(self.options);

        self.InitCanvas(tempcanvas);//初始化画布
        self.AsixUpdate();//绘制X、Y轴
        self.InitChart(tempcanvas);//绘制图形主体
    };

    //初始化画布
    self.InitCanvas=function(_canvas){
        var context = _canvas.getContext("2d");

        context.clearRect(0,0,_canvas.width,_canvas.height);//清除绘制区域

        // 绘制背景
        //var gradient = context.createLinearGradient(0,0,0,300);
        context.fillStyle = self.options.backgroundcolor;//背景色
        context.fillRect(0,0,_canvas.width,_canvas.height);//绘制画布区域

        // 描绘边框
        context.lineWidth = self.options.border.width;
        context.strokeStyle =self.options.border.color;
        context.beginPath();
        context.moveTo(0,0);
        context.lineTo(0,_canvas.height);
        context.lineTo(_canvas.width,_canvas.height);
        context.lineTo(_canvas.width,0);
        context.lineTo(0,0);
        context.fill();

        context.stroke();
    }
    //X绘制 X轴、Y轴
    self.AsixUpdate=function(){
        var CanvasInfo={width:self.options.container.width(),height:self.options.container.height(),strtx:self.options.container.offset().left,starty:0};

        //region Y轴绘制
        var yasixcanvsid=self.options.container[0].id+"_chart";
        var yasixcanvs=document.getElementById(yasixcanvsid);
        var yasixcontext = yasixcanvs.getContext("2d");

        // 描绘线条
        yasixcontext.lineWidth =self.options.yasix.linewidth;
        yasixcontext.strokeStyle =self.options.yasix.linecolor;
        yasixcontext.fillStyle =self.options.yasix.label.fontcolor;
        yasixcontext.beginPath();
        yasixcontext.moveTo(self.options.padding.left,self.options.padding.top);
        yasixcontext.lineTo(self.options.padding.left+0.5,(CanvasInfo.height-self.options.padding.bottom)+0.5);
        yasixcontext.stroke();

        //绘制每列的刻度
        var ytickintever=(CanvasInfo.height-self.options.padding.top-self.options.padding.bottom)/10;
        var starttop=self.options.padding.top;
        var  ypx_sizevalue=(self.options.minmax.max_y-self.options.minmax.min_y)/(CanvasInfo.height-self.options.padding.top-self.options.padding.bottom);
        var temptoppx=CanvasInfo.height-self.options.padding.bottom;

        self.options.yasix.items=[];

        yasixcontext.lineWidth =self.options.yasix.tickwidth;
        yasixcontext.strokeStyle =self.options.yasix.tickcolor;
        yasixcontext.beginPath();
        for(var j=0;j<10;j++){
            self.options.yasix.items.push(temptoppx-(ytickintever*(j+1))+0.5);
            yasixcontext.moveTo(self.options.padding.left+0.5,temptoppx-(ytickintever*(j+1))+0.5);

            if(j%2==0){
                yasixcontext.lineTo((self.options.padding.left-self.options.yasix.ticklength-3)+0.5,(temptoppx-(ytickintever*(j+1)))+0.5);
                addticklabel("y",yasixcontext,(self.options.padding.left-self.options.yasix.ticklength-8)+0.5,
                    temptoppx-(ytickintever*(j+1))+0.5,(self.options.minmax.min_y+ypx_sizevalue*ytickintever*(j+1)).toFixed(self.options.yasix.label.float));
            }else{
                yasixcontext.lineTo(self.options.padding.left-self.options.yasix.ticklength+0.5,temptoppx-(ytickintever*(j+1))+0.5);
            }
        }
        yasixcontext.stroke();

        //endregion

        //region X轴绘制
        var xasixcanvsid=self.options.container[0].id+"_chart";
        var xasixcanvs=document.getElementById(xasixcanvsid);
        var xasixcontext = xasixcanvs.getContext("2d");
        //xasixcontext.clearRect(self.options.padding.left,(CanvasInfo.height-self.options.padding.bottom),(CanvasInfo.width-self.options.padding.left-self.options.padding.right),self.options.padding.bottom);

        // 描绘线条
        xasixcontext.lineWidth =self.options.xasix.linewidth;
        xasixcontext.fillStyle =self.options.xasix.label.fontcolor;
        xasixcontext.strokeStyle =self.options.xasix.linecolor;
        xasixcontext.beginPath();
        xasixcontext.moveTo(self.options.padding.left+0.5,(CanvasInfo.height-self.options.padding.bottom)+0.5);
        xasixcontext.lineTo((CanvasInfo.width-self.options.padding.right)+0.5,(CanvasInfo.height-self.options.padding.bottom)+0.5);
        xasixcontext.stroke();

        xasixcontext.lineWidth=self.options.xasix.tickwidth;
        xasixcontext.strokeStyle=self.options.xasix.tickcolor;
        xasixcontext.beginPath();
        //绘制每列的刻度
        if(self.options.xasix.xtype=="number"){
            var xtickintever=(CanvasInfo.width-self.options.padding.left-self.options.padding.right)/10;
            var startleft=self.options.padding.left;
            var  xpx_sizevalue=(self.options.minmax.max_x-self.options.minmax.min_x)/(CanvasInfo.width-self.options.padding.left-self.options.padding.right);
            var templeftpx=startleft;

            self.options.xasix.items=[];
            for(var j=0;j<10;j++){
                xasixcontext.moveTo(templeftpx+(xtickintever*(j+1))+0.5,(CanvasInfo.height-self.options.padding.bottom)+0.5);
                self.options.xasix.items.push(templeftpx+(xtickintever*(j+1))+0.5);
                if(j%2==0){
                    xasixcontext.lineTo(templeftpx+(xtickintever*(j+1))+0.5,(CanvasInfo.height-self.options.padding.bottom+self.options.xasix.ticklength+3)+0.5);
                    addticklabel("x",xasixcontext,templeftpx+(xtickintever*(j+1))+0.5,(CanvasInfo.height-self.options.padding.bottom+self.options.xasix.ticklength+15+0.5),
                        (self.options.minmax.min_x+xpx_sizevalue*xtickintever*(j+1)).toFixed(self.options.xasix.label.float));
                }else{
                    xasixcontext.lineTo(templeftpx+(xtickintever*(j+1))+0.5,(CanvasInfo.height-self.options.padding.bottom+self.options.xasix.ticklength)+0.5);
                }
            }
        }else {
            var xtickintever=(CanvasInfo.width-self.options.padding.left-self.options.padding.right)/self.options.data.length;
            var startleft=self.options.padding.left;
            var templeftpx=startleft;
            var bolIsDraw=false;
            self.options.xasix.items=[];
            for(var j=1;j<=self.options.data.length;j++){
                bolIsDraw=false;
                if(self.options.xasix.tickinterval!=null && self.options.xasix.tickinterval>0){
                    if(j%self.options.xasix.tickinterval==0){
                        bolIsDraw=true;
                    }
                }else{
                    bolIsDraw=true;
                }
                if(bolIsDraw){
                    self.options.xasix.items.push(templeftpx+(xtickintever*j)+0.5);

                    xasixcontext.moveTo(templeftpx+(xtickintever*j)+0.5,(CanvasInfo.height-self.options.padding.bottom)+0.5);
                    xasixcontext.lineTo(templeftpx+(xtickintever*j)+0.5,(CanvasInfo.height-self.options.padding.bottom+self.options.xasix.ticklength)+0.5);
                    addticklabel("x",xasixcontext,templeftpx+(xtickintever*j)+0.5,(CanvasInfo.height-self.options.padding.bottom+self.options.xasix.ticklength+15+0.5),
                        (self.options.data[j-1][0]).toFixed(self.options.xasix.label.float));
                }
            }
        }
        xasixcontext.stroke();
        //endregion

        var chartcanvs=document.getElementById(self.options.container[0].id+"_chart");
        var chartcontext = chartcanvs.getContext("2d");
        chartcontext.restore();
        if(self.options.yasix.gridline.width>0){
            chartcontext.beginPath();
            chartcontext.lineWidth =self.options.yasix.gridline.width;
            chartcontext.strokeStyle =self.options.yasix.gridline.color;

            for(var i=0;i<self.options.yasix.items.length;i++){
                chartcontext.moveTo(self.options.padding.left,self.options.yasix.items[i]);
                chartcontext.lineTo((CanvasInfo.width-self.options.padding.right),self.options.yasix.items[i]);
            }
            chartcontext.stroke();
        }
        if(self.options.xasix.gridline.width>0){
            chartcontext.beginPath();
            chartcontext.lineWidth =self.options.xasix.gridline.width;
            chartcontext.strokeStyle =self.options.xasix.gridline.color;

            for(var i=0;i<self.options.xasix.items.length;i++){
                chartcontext.moveTo(self.options.xasix.items[i],(CanvasInfo.height-self.options.padding.bottom));
                chartcontext.lineTo(self.options.xasix.items[i],self.options.padding.top);
            }
            chartcontext.stroke();
        }

    }
    //初始化绘制图形
    self.InitChart=function(_canvas){
        var context = _canvas.getContext("2d");
        // 将数据换算为坐标
        var points = [];

        var px=null,py=null;
        for( var i=0; i < self.options.data.length; i++){
            if(self.options.xasix.xtype=="number"){
                px =(_canvas.width-self.options.padding.left-self.options.padding.right)*(self.options.data[i][0]-self.options.minmax.min_x)/(self.options.minmax.max_x-self.options.minmax.min_x);
            }else{
                px =(_canvas.width-self.options.padding.left-self.options.padding.right)*(i+1)/self.options.data.length;
            }
            py = (_canvas.height-self.options.padding.top-self.options.padding.bottom) - ((_canvas.height-self.options.padding.top-self.options.padding.bottom)*(self.options.data[i][1]-self.options.minmax.min_y)/(self.options.minmax.max_y-self.options.minmax.min_y));
            points.push({"x":(px+self.options.padding.left),"y":(py+self.options.padding.top)});
        }

        context.lineWidth=self.options.linewidth;//线条粗细
        //region 1.绘制线条
        switch(self.options.type){
            case "line":
                //regin 绘制折线
                context.beginPath();
                context.moveTo(points[0].x,points[0].y);
                for(var i= 1; i< points.length; i++){
                    context.lineTo(points[i].x,points[i].y);
                }
                //endregion
                break;
            case  "spline":
                //region 绘制曲线
                var ControlPoint={x1:0,y1:0,x2:0,y2:0};
                var p=0.25;
                //绘制曲线
                context.beginPath();
                for(var i= 0;i<(points.length-1); i++){
                    if(i==0){
                        ControlPoint.x1=points[i].x;
                        ControlPoint.y1=points[i].y;
                    }else{
                        ControlPoint.x1=points[i].x+(points[i+1].x-points[i-1].x)*p;
                        ControlPoint.y1=points[i].y+(points[i+1].y-points[i-1].y)*p;
                    }
                    if(points[i+2]==null){
                        ControlPoint.x2=points[i+1].x-(points[i+1].x-points[i].x)*p;
                        ControlPoint.y2=points[i+1].y-(points[i+1].y-points[i].y)*p;
                    }else{
                        ControlPoint.x2=points[i+1].x-(points[i+2].x-points[i].x)*p;
                        ControlPoint.y2=points[i+1].y-(points[i+2].y-points[i].y)*p;
                    }
                    context.bezierCurveTo(ControlPoint.x1,ControlPoint.y1,ControlPoint.x2,ControlPoint.y2,points[i+1].x,points[i+1].y);
                }
                //endregion
                break;
            case "area":
                //region 面积图处理
                context.beginPath();
                if(self.options.linewidth!=null && self.options.lineWidth>0){
                    context.moveTo(points[0].x,points[0].y);
                    for(var i= 1; i< points.length; i++){
                        context.lineTo(points[i].x,points[i].y);
                    }
                    context.restore();
                    context.stroke();
                }

                //region 面积区域颜色填充
                context.beginPath();
                context.lineWidth=0.0001;//线条粗细
                context.fillStyle=self.options.fillcolor;//区域填充颜色
                context.moveTo(points[0].x,(_canvas.height-self.options.padding.bottom));
                context.lineTo(points[0].x,points[0].y);
                for(var i= 1; i< points.length; i++){
                    context.lineTo(points[i].x,points[i].y);
                }
                context.lineTo(points[points.length-1].x,(_canvas.height-self.options.padding.bottom));
                context.fill();
                //endregion
                //endregion
                break;
            case "column":
                var harfwidth=parseInt(calccolumnwidth(points)/2);
                context.lineWidth=0.0001;//线条粗细
                if(self.options.linewidth!=null && self.options.lineWidth>0){
                    context.lineWidth=self.options.linewidth;//线条粗细
                }
                context.fillStyle=self.options.fillcolor;//区域填充颜色

                for(var i= 0; i< points.length; i++){
                    context.beginPath();
                    context.moveTo(points[i].x-harfwidth,(_canvas.height-self.options.padding.bottom));
                    context.lineTo(points[i].x-harfwidth,points[i].y);
                    context.lineTo(points[i].x+harfwidth,points[i].y);
                    context.lineTo(points[i].x+harfwidth,(_canvas.height-self.options.padding.bottom));

                    context.fill();
                    context.restore();
                    context.stroke();
                }
                break;
            default:
                break;
        }

        context.lineWidth =self.options.linewidth;
        context.strokeStyle =self.options.linecolor;
        context.restore();
        context.stroke();
        //endregion

        //region 2.绘制对应marker点
        //设置字体样式
        context.beginPath();
        if(self.options.type=="line"){
            context.fillStyle =self.options.marker.color;
            context.arc(points[0].x, points[0].y,2,0,2*Math.PI,true);//圆点 marker
            //region 绘制超过规格线的点
            for(var i= 1; i< points.length; i++){
                context.moveTo(points[i].x, points[i].y);
                //context.fillRect(points[i].x-2, points[i].y-2,4,4);//正方形 marker
                context.restore();
                context.arc(points[i].x, points[i].y,2,0,2*Math.PI,true);//圆点 marker
            }
            context.fill();
            context.stroke();

            context.restore();
            context.font =self.options.marker.label.fontsty;
            context.fillStyle =self.options.marker.label.fontcolor;
            context.beginPath();
            if(self.options.marker.label.enabled){
                context.fillText(self.options.data[0][1],points[0].x+8,points[0].y+10);
            }
            for(var i= 1; i< points.length; i++){
                if(self.options.marker.label.enabled){
                    context.fillText(self.options.data[i][1],points[i].x+8,points[i].y+10);
                }
            }
            //endregion
            context.fill();
            context.stroke();
        }else{
            if(self.options.type=="spline" || self.options.type=="area"){
                context.fillStyle =self.options.marker.color;
                context.arc(points[0].x, points[0].y,2,0,2*Math.PI,true);//圆点 marker

                //region 绘制超过规格线的点
                for(var i= 1; i< points.length; i++){
                    context.moveTo(points[i].x, points[i].y);
                    //context.fillRect(points[i].x-2, points[i].y-2,4,4);//正方形 marker
                    context.restore();
                    context.arc(points[i].x, points[i].y,2,0,2*Math.PI,true);//圆点 marker
                }
                context.fill();
                context.stroke();

                context.restore();
                context.font =self.options.marker.label.fontsty;
                context.fillStyle =self.options.marker.label.fontcolor;
                context.beginPath();
                if(self.options.marker.label.enabled){
                    context.fillText(self.options.data[0][1],points[0].x+8,points[0].y+10);
                }
                for(var i= 1; i< points.length; i++){
                    if(self.options.marker.label.enabled){
                        context.fillText(self.options.data[i][1],points[i].x+8,points[i].y+10);
                    }
                }

                //endregion
                context.fill();
                context.stroke();
            }
        }
        //endregion
        //返回对应点坐标
        self.options.points=points;
    }
    //显示tooltips信息
    self.ShowToolTips=function(obj,_ev){
        if(_ev.type=="mouseout"){
            var toltipscanvas=self.options.container[0].id+"_tooltipcanvas";
            var tempcanvas=document.getElementById(toltipscanvas);
            if(tempcanvas!=null){
                $("#"+toltipscanvas).remove();
            }
        }else{
            var tooltipmarkerindex=-1;
            if(self.options.points!=null && self.options.points.length>0){
                for(var i=0;i<self.options.points.length;i++){
                    if(Math.abs(self.options.points[i].x-_ev.offsetX)<=2 && Math.abs(self.options.points[i].y-_ev.offsetY)<=2 ){
                        tooltipmarkerindex=i;
                        break;
                    }
                }
            }
            if(tooltipmarkerindex>-1){
                //添加canvas 画布
                var toltipscanvas=self.options.container[0].id+"_tooltipcanvas";
                var tempcanvas=document.getElementById(toltipscanvas);
                if(tempcanvas!=null){
                    $("#"+toltipscanvas).remove();
                }
                var tempcanvas=$("<canvas id='"+toltipscanvas+"'></canvas>").attr({
                    "width":"100px",
                    "height":"25px"
                }).css({
                    "position":"absolute",
                    "left":(self.options.points[tooltipmarkerindex].x+15)+"px",
                    "top":(self.options.points[tooltipmarkerindex].y)+"px"
                }).appendTo(self.options.container);

                tempcanvas=document.getElementById(toltipscanvas);

                var context = tempcanvas.getContext("2d");
                // 绘制背景
                context.fillStyle = self.options.tooltips.backgroundcolor;
                // 描绘边框
                context.lineWidth = self.options.tooltips.border.width;
                context.strokeStyle =self.options.tooltips.border.color;
                context.beginPath();
                context.moveTo(0,0);
                context.lineTo(0,tempcanvas.height);
                context.lineTo(tempcanvas.width,tempcanvas.height);
                context.lineTo(tempcanvas.width,0);
                context.lineTo(0,0);
                //绘制矩形，以填充背景色
                context.fillRect(0,0,tempcanvas.width,tempcanvas.height);
                context.stroke();

                context.fillStyle =self.options.tooltips.color;
                context.font =self.options.tooltips.fontsty;
                context.beginPath();
                //region 填充文字
                var text="x:"+self.options.data[tooltipmarkerindex][0]+" , y:"+self.options.data[tooltipmarkerindex][1];
                context.fillText(text,10,15);
                //endregion
                context.stroke();
            }
        }
    }
    //数据更新
    self.DataUpdate=function(_data){
        self.options.data=_data;

        var container=self.options.container;
        //添加canvas 画布
        var canvasid=container[0].id+"_chart";

        //图形canvas对象
        tempcanvas=document.getElementById(canvasid);
        self.options.minmax=getasixminmax(self.options);

        self.InitCanvas(tempcanvas);//初始化画布
        self.AsixUpdate();//绘制X、Y轴
        self.InitChart(tempcanvas);//绘制图形主体
    }
    self.Refresh();

    function getasixminmax(_options){
        _data=_options.data;

        var maxvalue={min_x:0,max_x:0,min_y:0,max_y:0};
        var xArray=[],yArray=[];
        for(var i=0;i<_data.length;i++){
            xArray.push(_data[i][0]);
            yArray.push(_data[i][1]);
        }
        xArray.sort(function compare(a,b){return a-b;});
        yArray.sort(function compare(a,b){return a-b;});
        if(_options.xasix.xtype=="number"){
            maxvalue.min_x=xArray[0];
            maxvalue.max_x=xArray[xArray.length-1];
        }else{
            maxvalue.min_x=null;
            maxvalue.max_x=null;
        }

        maxvalue.min_y=getnearvalue(yArray[0],"min");
        maxvalue.max_y=getnearvalue(yArray[yArray.length-1],"max");
        return maxvalue;
    }//获取X,Y轴最小&最大值
    function mergeObject(obj1, obj2) {
        var output = {};

        if(!obj2) {
            return obj1;
        }

        for (var prop in obj1) {
            if (prop in obj2) {
                output[prop] = obj2[prop];
            } else {
                output[prop] = obj1[prop];
            }
        }
        return output;
    }//属性合并
    function addticklabel(_type,_canvascontent,_x,_y,_text){
        //_type:x轴或y轴类型值,"x","y"    _canvascontent:画布对象  _x:起始x坐标  _y:起始y坐标 _text:文本内容
        if(_type=="x"){
            //var position={left:$(_canvas).offset().left+_x,top:$(_canvas).offset().top+_y};
            //$("<div class='ticklabelsty'>"+_text+"</div>").css({
            //    "width":"9px",
            //    "left":position.left+"px",
            //    "top":position.top+"px",
            //    "-webkit-transform":"rotate(90deg)",
            //    "color":chartoptions.asixfontcolor
            //}).appendTo($(document.body));
            _canvascontent.font =self.options.xasix.label.fontsty;
            _canvascontent.fillText(_text,_x-5,_y);
        }else{
            //var position={left:$(_canvas).offset().left+_x,top:$(_canvas).offset().top+_y};
            //$("<div class='ticklabelsty'>"+_text+"</div>").css({
            //    "width":"60px",
            //    "left":position.left+"px",
            //    "top":position.top+"px",
            //    "textAlign":"right",
            //    "color":chartoptions.asixfontcolor
            //}).appendTo(self.options.container);
            _canvascontent.font =self.options.yasix.label.fontsty;
            _canvascontent.fillText(_text,_x-30,_y);
        }
    }//显示坐标轴标签
    function getdemodata(){
        var demodata=[];
        for(var i=1;i<=30;i++){
            demodata.push([i,crandom(30,85)]);
        }
        return demodata;
    }
    function crandom(n,m){
        var c = m-n+1;
        return  Math.floor(Math.random() * c + n);
    }
    function getnearvalue(_value,_type){
        var tempvalue=Math.abs(_value);
        var returnvalue=null;
        var Ra=1;
        if(tempvalue<1){
            var strvalue=tempvalue+"";
            Ra=Math.pow(10,strvalue.substring(strvalue.indexOf(".")+1,strvalue.length).length);
            tempvalue=tempvalue*Ra;
        }
        if(tempvalue%10==0){
            if(_type=="min"){
                if(_value<0){
                    returnvalue=((tempvalue/10)+1)*10/Ra;
                }else{
                    returnvalue=((tempvalue/10)-1)*10/Ra;
                }
            }else{
                if(_value<0) {
                    returnvalue = ((tempvalue / 10) - 1) * 10 / Ra;
                }else{
                    returnvalue = ((tempvalue / 10) + 1) * 10 / Ra;
                }
            }
        }else{
            if(_type=="min"){
                if(_value<0) {
                    returnvalue = (parseInt(tempvalue / 10)+1) * 10 / Ra;
                }else{
                    returnvalue = (parseInt(tempvalue / 10)) * 10 / Ra;
                }
            }else{
                if(_value<0) {
                    returnvalue = (parseInt(tempvalue / 10)) * 10 / Ra;
                }else{
                    returnvalue = (parseInt(tempvalue / 10) + 1) * 10 / Ra;
                }
            }
        }
        if(_value<0){
            returnvalue=0-returnvalue;
        }
        return returnvalue;
    }//计算最大最小值范围
    function calccolumnwidth(_points){
        var spacevalue=-1;
        var bolsucced=true;
        for(var i=100;i>=5;i=i-5){
            bolsucced=true;
            for(var j=1;j<_points.length;j++){
                if(_points[j].x-i-10>_points[j-1].x){
                }else{
                    bolsucced=false;
                    break;
                }
            }
            if(bolsucced){
                spacevalue=i;
                break;
            }
        }
        if(spacevalue>-1){
        }else{
            spacevalue=_points[1].x-1-_points[0].x;
            for(var j=2;j<_points.length;j++){
                if(_points[j].x-1-_points[j-1].x<spacevalue){
                    spacevalue=_points[j].x-1-_points[j-1].x;
                }
            }
        }
        return spacevalue;
    }//计算柱子合理宽度
    //demo数据
}