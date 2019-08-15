
const colorPairs =  [ 
    {   c1:"#FF00FF",c2: "#FF00FF" },
    {   c1:"#FF6633",c2: "#FF6633" },
    {   c1:"#FF9966",c2: "#FF9966" },
    {   c1:"#0066FF",c2: "#0066FF" },
    {   c1:"#00CCFF",c2: "#00CCFF" }
];

const ndpSeg    =   {
    SegId: "",
    NextDartsNeeded: 9,
    ScoreAfterDart: 501,
    NewColor: "#000000"
}

const favDbls = [
    { seg:"D20", val: 40 }, 
    { seg:"D16", val: 32 }, 
    { seg:"DBL", val: 50 }
];

const favTrpls = [
    { seg:"T20", val: 60 }, 
    { seg:"T19", val: 57 }, 
    { seg:"T18", val: 54 }
];

let clrArr = [
    "#006400",  // 0: DarkGreen  same darts needed
    "#00ff00",  // lime          -1 darts needed
    "#ffab00",  // orange        +1 darts needed
    "#ff0000"   // red           bust !
];

let ndpSegArray     =   [];
let scores          =   [];
let jscores         =   d3.json( "data/scores.json" );

if( !scores ){
    console.log("ndp.js jsonSegArr doesn't exist" );
}else{
    if( scores.length > 1 ){
        console.log("ndp.js scores exists + loaded", scores.length );
    }else{
        jscores.then( 
            (data)=>{ 
                scores = data; 
                console.log("ndp.js scores existed but then not loaded", scores.length );
            }
        ).then(
            ()=>{ getNDPData(); }
        );
    }
}

function sb(){
    let newSB = 121;
    let sbEl = document.getElementById('sb').value ;
    // console.log("function sb:", sbEl );
    return sbEl;
}

function getDN(score){
    let retvalDN;
        if( scores.length>1){
            // console.log( "getDN ", score, "scores[score]", scores[score] );
            retvalDN = scores[score].DARTSNEEDED;
        }else{
            // console.log("scores.length !> 1");
            retvalDN = 9;
        }
    return retvalDN;
}

function ndpClrs(dnDiff){
    let dnClrId = 0;
    switch(dnDiff){
        case -1:    dnClrId = 2;
                    break;
        case 0:     dnClrId = 0;
                    break;
        case 1:     dnClrId = 1;
                    break;
        case 2:     dnClrId = 3;
                    break;
    }
   // console.log("dnDiff", dnDiff, "dnClrId", dnClrId, "same?", ( dnClrId === ( dnDiff + 1 ) )  );
    return  clrArr[dnClrId]
}

function getNDPData(){
    console.log(
        "array stati:", 
        "scores", scores.length,
        "jsonSegArr", jsonSegArr.length,
        "sb", getDN( sb() )
    );
    createDartBoard();

    ndpSegArray = [];
    
    let fnsb    =   sb();
    let sbdn    =   getDN(fnsb);
    console.log("getNDPData: fnsb", fnsb, "sbdn", sbdn);

    for(let i=0; i < jsonSegArr.length ;i++){
        let seg         = jsonSegArr[i];
        if( seg.SegMulti > 0 ){
            let thisSegSA   = (fnsb - seg.SegVal); 
            let thisSegDN   = getDN( thisSegSA );
            let thisDNDiff  = (sbdn - thisSegDN); 
            let arrEntry    = {};
            arrEntry.SegId              =  seg.SegId;
            arrEntry.NextDartsNeeded    =  getDN( thisSegSA );
            arrEntry.ScoreAfterDart     =  thisSegSA ;
            arrEntry.NewColor           =  ndpClrs(thisDNDiff);

            if( thisDNDiff !=0 ){
                d3.select("#"+ seg.SegId ).style("fill", arrEntry.NewColor );
                console.log(
                    "checking dartboard (", seg.SegId , 
                    "segVal",               seg.SegVal,     
                    "thisSegSA",            thisSegSA,  
                    "thisSegDN",            thisSegDN, 
                    "thisDNDiff",           thisDNDiff,
                    "arrEntry:",            arrEntry 
                );    
            }else{
                d3.select("#"+ seg.SegId ).style("fill", "#006400" );
            }
        }
    }
}

function getNDPathToFD(){
    let finishesAll     = [];
    let finishesFDbl    = [];
    /*
        [   { 
                seg: "",
                va;: 0,
            },
            { 
                seg: "",
                va;: 0,
            },
            { 
                seg: "",
                va;: 0,
            }
        ]
    */
    let finishesFTrpl   = [];
    let finSB = sb();
    let dn = getDN( finSB );
    let pathAlive = true; // positive start ;-)
    console.log("getNDPathToFD ", "finSB", finSB , "dn", dn)
    switch( dn ){
        /* if dn = 0 */
        case 0:     // no route to fav Dbls
                    pathAlive = false;
                    break;

        /* if dn = 1 */
        case 1:     // only 1 route to fav Dbls
                    pathAlive = false; 
                    if( finSB == favDbls[0].val ){
                        pathAlive = true; 
                        finishesFDbl.push( { 'dart': 1, 'seg': favDbls[0].seg , 'val': favDbls[0].val } )
                    }else if( finSB == favDbls[1].val ){
                        pathAlive = true; 
                        finishesFDbl.push({ 'dart': 1, 'seg': favDbls[1].seg , 'val': favDbls[1].val } )
                    }else if( finSB == favDbls[2].val ){
                        pathAlive = true; 
                        finishesFDbl.push({ 'dart': 1, 'seg': favDbls[2].seg , 'val': favDbls[2].val } )
                    }

                    // console.log("switch( dn 1: pathAlive ", pathAlive, finishesFDbl );
                    break;

        /* if dn = 2 */
        case 2:     // 2 darters all fav ds can be possible
                    let fdArrVals = [
                        favDbls[0].val,
                        favDbls[1].val,
                        favDbls[2].val
                    ];

                    pathAlive = false; 
                    // console.log("switch( dn 2: pathAlive ", pathAlive );
                    for(fdval=0; fdval<3; fdval++){
                        console.log("case 2 each fd val", fdArrVals[fdval] );
                        let segExixts = lpThruVal( (finSB - fdArrVals[fdval]) ,"board") ;
                            if( segExixts.status == true ){ 
                                pathAlive = true;
                                let flOption = 
                                   [   
                                    { 'dart': 1, 'seg':segExixts.seg ,'val': segExixts.val },
                                    { 'dart': 2, 'seg':favDbls[fdval].seg ,'val': favDbls[fdval].val },
                                ]
                                finishesFDbl.push( flOption );                       
                            }
                    
                    }
                    // console.log("switch( dn 2: pathAlive ", pathAlive, finishesFDbl );
                    break;

        /* if dn = 3 */
        case 3:     // 3 darters ..
                    pathAlive = false; 
                    sbProfile = scores[finSB].EZVISITPROFILE.split("-");
                    let srchForArr = [];

                    for(p=0;p<sbProfile.length;p++ ){
                        if( sbProfile[p] == "T" ){ srchForArr.push(3) }
                        if( sbProfile[p] == "D" | sbProfile[p] == "DB"  ){ srchForArr.push(2) }
                        if( sbProfile[p] == "S" | sbProfile[p] == "SB" ){ srchForArr.push(1) }    
                    }
 
                  //  console.log("checking 3 darter ", finSB, "prf:", sbProfile, "srchForArr", srchForArr );
                    for(drt1=0; drt1<102 ;drt1++){
                        let drt1SegId = jsonSegArr[drt1];
                        if( ( getDN(finSB-drt1SegId.SegVal) != 2 ) ){  continue }
                        
                        if( srchForArr[0] == drt1SegId.SegMulti ){
                            // dartvalue of drt1 != 0, need to check !
                            for(drt2=0; drt2<102 ;drt2++){
                                let drt2SegId = jsonSegArr[drt2];

                                if( srchForArr[1] == drt2SegId.SegMulti ){
                                    // dartvalue of drt1 != 0, need to check !
                                    for(drt3=0; drt3<3 ;drt3++){
                                        let drt3SegId = favDbls[drt3];
                                        let isCscore  = ( ((drt1SegId.SegVal)+(drt2SegId.SegVal)+(drt3SegId.val)) == finSB )

                                        if(isCscore){ 
                                            pathAlive = true; 
                                            let df = ( drt1SegId.SegMulti * drt2SegId.SegMulti * 2 );

                                            if( drt1SegId.SegId == "DBL" ){
                                                df = ( ( drt1SegId.SegMulti * 1.5 ) * drt2SegId.SegMulti * 2 );
                                            }else if( drt2SegId.SegId == "DBL" ){
                                                df = ( ( drt2SegId.SegMulti * 1.5 ) * drt1SegId.SegMulti * 2 );
                                            }else if( drt3SegId.seg == "DBL" ){
                                                df = ( drt1SegId.SegMulti * drt2SegId.SegMulti * 3 );
                                            }
                                            /*

                                            console.log(
                                                "this path is a possible option for", finSB, 
                                                drt1SegId.SegId, 
                                                drt2SegId.SegId,
                                                drt3SegId.seg,
                                                "=", isCscore ,
                                                "df", df
                                            )
                                            */

                                            if( (drt2SegId.SegVal > drt1SegId.SegVal) && (srchForArr[0] == "T") ){
                                                // skip this option we'll take with the highest T first
                                            }else if( drt1SegId.SegId.slice(0,1)=="S" ){  
                                                // skip this option we'll take with the highest T first
                                            }else if( drt2SegId.SegId.slice(0,1)=="S" ){  
                                                // skip this option we'll take with the highest T first
                                            }else{
                                                let flOption = [
                                                                    { 'dart': 1, 'seg':drt1SegId.SegId ,   'val': drt1SegId.SegVal     },
                                                                    { 'dart': 2, 'seg':drt2SegId.SegId ,   'val': drt2SegId.SegVal     },
                                                                    { 'dart': 3, 'seg':drt3SegId.seg ,     'val': drt3SegId.val   },
                                                                    { 'diff': df }
                                                ];
                                                finishesFDbl.push( flOption );                                     
                                            }
                                        }
                                    } // End of: dart 3 loop

                                }else{
                                    // dartvalue of drt2 == 0, no need to check.
                                }     
                            } // End of: dart 2 loop

                        }else{
                            // dartvalue of drt1 == 0, no need to check.
                        } // End of: dartvalue of drt1 != 0, need to check !
                    } // nd of: dart 1 loop

                    console.log("switch( dn 3: pathAlive ", pathAlive, finishesFDbl );

                    break;

        /* if dn > 3 */
        default:        pathAlive = false;
                        console.log("switch( dn defauly: pathAlive ", pathAlive, finishesFDbl );
                        break;

    }
}

function lpThruVal(val, arrName){
    let retvalLp = { status: false, seg: "", val: 0 };
    if(arrName == "favs"){
        for(let fd=0; fd<3;fd++){
            // loop thru the three fav doubles and see if a finish cab be made
            let fdSeg = favDbls[fd];
            
            if( fdSeg.val == val ){ 
                retvalLp.status = true;
                retvalLp.seg = fdSeg.seg ;
                retvalLp.val = fdSeg.val ;
              //  console.log("found match !", fdSeg )
            }
            
            // console.log("retvalLp", retvalLp)
        } 
        return retvalLp ;
    }else if(arrName == "board"){
        for(let fd=0; fd<102;fd++){
            // loop thru the dartboard segments and see if a finish cab be made
            let fdSeg =  jsonSegArr[fd];

            if( fdSeg.SegVal == val ){ 
                retvalLp.status = true;
                retvalLp.seg = fdSeg.SegId ;
                retvalLp.val = fdSeg.SegVal ;
               // console.log("found match !", fdSeg )
            }

//            console.log("retvalLp", retvalLp)
        } 
        return retvalLp ;
    }
}

/*
console.log(
    "-1:", ndpClrs(-1),lr,
    " 0:", ndpClrs(0), lr,
    " 1:", ndpClrs(1), lr,
    " 2:", ndpClrs(2), lr
)
*/
