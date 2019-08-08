let lr = '\n';
let dbJSDataUrl     = "jsDartBoard102.js";
let jdSegArray 	    = jsdartboard102 ;
let divWidth        = document.getElementById("mySVGdartBoard").getAttribute("width");
let jdMNSegArrLen 	= jdSegArray.length || 0 ;
let scrnW			= (document.innerWidth *0.66);
let ActDim 			= (scrnW * (1/divWidth) ) || 500  ; 
let CurDrtBid 		= "jdDartBoard" ;
let pageLoc         = location.origin;

console.log(
    "darboard creation: ", lr, 
    "ActDim: ", ActDim, lr,
    "DartBoardId: ", CurDrtBid, lr,
    'jdSegArray len: ' , jdMNSegArrLen,
    "hosted on:", pageLoc
) ;

d3.select(".JDDbCanvas").remove();
d3.select(".dartboardbg").remove();
d3.select(".JDDbSgmnt").remove();
d3.select(".JDDbSegment").remove();
d3.select(".JDDMDOTxt").remove();

let mySvgMsgCntr =  d3.select("#msgCenter") ;
let mySvg = d3.select( "#mySVGdartBoard")
                .attr("width",  ActDim  )
                .attr("height", ActDim  )
                    .append("svg")
                        .attr("x", 		"1px"           )
                        .attr("y", 		"1px"           )
                        .attr("width", 	ActDim          )
                        .attr("height", ActDim          )
                        .attr("fill", 	"#005C00"       )
                        .attr("id",     CurDrtBid       )
                        .attr("class", 	"JDDbCanvas"    )
            ;

    // starting dartboard build
    let JDDbSgmntCount = 0 ;
    let JDDbRadPercArr = [ 0, 0.0500, 0.1200, 0.4900, 0.5900, 0.8100, 0.8900, 0.8907, 0.9999 ];
    let JDDbTxtClr = "#FFFFFF" ;
    let JDDbCrclTxtSTAngle = 288 ;	// The total of text length 40%
    let JDDbCrclTxtEndAngle = 72 ;	// The total of text length 40%
    let JDDbCrclStartAngle = 9 ;
    let JDDbCrcSgmntPerc = 18 ;
    let JDDbCntr = (ActDim * 0.5 ) ; 
    let JDDbR = (ActDim * 0.4995) ;	
    let JDDbMDOTxtSz = (((JDDbR * (JDDbRadPercArr[8] - JDDbRadPercArr[7])) / 21) * 0.85) ;

    d3.select( ".JDDbCanvas" )
        .append("rect")
            .attr("x", '0px')
            .attr("y", '0px') 
            .attr("width", (ActDim))
            .attr("height", (ActDim))
            .attr("id", "dartboardbg")
            .attr("fill", "#6699ff")
    ;	// End of: rect svg + DNN

    let JDDbSgmntGrp    =   d3.select(".JDDbCanvas")
                                .append("g")
                                    .attr("id", "JDDbSgmnts")
                                    .attr("class", "JDDbSgmnt")
                                    .attr("stroke-width", 0)
                                    .attr("stroke", "#C0C0C0")
                                    .attr("transform", "translate(" + JDDbCntr + "," + JDDbCntr + ")")
                            ;

    let JDDbSgmntTxtGrp =   d3.select( ".JDDbCanvas" )
                                .append("g")
                                    .attr("id", "JDDbSgmntTxts")
                                    .attr("class", "JDDMDOTxt")
                                    .attr("stroke", "#000000") // #FFFFFF = white 
                                    .style("font-family", "helvetica")
                                    .style("font-size", JDDbMDOTxtSz + "em")
                                    .attr("stroke-width", 2)
                                    .attr("style", "stroke:#000000;")	// silver #C0C0C0
                                    .attr("style", "fill:#99CCFF;")		// #00FFFF
                                    .attr("text-anchor", "middle")
                                    .attr("transform", "translate(" + JDDbCntr + "," + JDDbCntr + ")")
                            ;

    let JDDbSgmntArc    =   d3.arc()
                                .innerRadius(   function(data){ return (JDDbR * JDDbRadPercArr[data.SegInRad]);})
                                .outerRadius(   function(data){ return ((JDDbR * 0.995) * JDDbRadPercArr[data.SegOutRad]);})
                                .startAngle(    function(data){ return (data.SegSA * (Math.PI/180));}) 
                                .endAngle(      function(data){ return (data.SegEA * (Math.PI/180)); }) 
                            ;

    JDDbSgmntGrp.selectAll("path")
        .data(jdSegArray) // starting the json data loop here jdMNSegArr
            .enter()
                .append("path")
                    .attr("d", JDDbSgmntArc)
                    .attr("id",         (data)=>{ return data.SegId; })
                    .attr("SegId",      (data)=>{ return data.SegId; })
                    .attr("SegVal",     (data)=>{ return data.SegVal;  })
                    .attr("SegGrp",     (data)=>{ return data.SegGrp; })
                    .attr("SegMulti",   (data)=>{ return data.SegMulti; })
                    .attr("style",      (data)=>{ return "fill:" + data.SegColor + ";"; } ) 
                    .attr("SegColor",   (data)=>{ return data.SegColor; } )
                    .attr("dart1", 'false') 
                    .attr("dart2", 'false') 
                    .attr("dart3", 'false') 
                    .attr("jdcolored", 'false') 
                    .attr("class", 'JDDbSegment' )
                    .on('click', FnSegmentClick )
    ; 

    JDDbSgmntTxtGrp.selectAll("text")
        .data(jdSegArray)
            .enter()
                .append("text")
                    .filter( (d)=>{ return d.SegMulti < 1; })
                    .attr("transform", 
                            (d)=>{ 
                                    d.innerRadius = (JDDbR * d.SegInRad);
                                    d.outerRadius = (JDDbR * d.SegOutRad);
                                    return "translate(" + JDDbSgmntArc.centroid(d) +") rotate(" + 1 + ")";
                            }
                    )
                    .text( (d)=>{ return parseInt(d.SegGrp,10); })
                        .attr("dx",1)	//	JDDbCntr
                        .attr("dy",5)	//	JDDbCntr	
                        .attr("id", ( (d)=>{ return d.SegId; } ) )
                        .attr("SegVal", '0' )
                        .attr("SegGrp", '0' )
                        .attr("SegMulti", '0' )
                        .attr("dart1",'false' ) 
                        .attr("dart2",'false' ) 
                        .attr("dart3",'false' ) 
                        .attr("class",'JDDbSegment' )
                        .on("click", FnSegmentClick )
    ;

    d3.select("pageLoc").append("<i>").text("This page is hosted on:" + pageLoc);

    function FnSegmentClick(d,i,e){
        let ClickedSegment = d ;
        let msg =   [   "You clicked on: ", 
                        ClickedSegment.SegId, 
                        " which has a value of: ", 
                        ClickedSegment.SegVal 
                    ].join("");

        let curMsgArr   = document.getElementsByClassName("dbMsgGrp");
        let curMsgCount = curMsgArr.length ;
        let msgHeight = ((ActDim / 8) + 5) ;
        let msgOffsetY = 10;
        mySvgMsgCntr
            .insert("div",":first-child")
                .text( msg )
                .attr("font-family",    "Verdana"           )
                .attr("font-size",      "24px"              )
                .attr("class",          "dbMsgT"            )
            ;

            console.log(
                "myNodes-FnSegmentClick:", " is active.", lr, 
                "ClickedSegment: ", ClickedSegment.SegTxt 
            );
    }
