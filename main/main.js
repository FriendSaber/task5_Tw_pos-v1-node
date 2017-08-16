const dat = require('../main/datbase');
var loadAllItems = dat.loadAllItems;
var loadPromotions = dat.loadPromotions;


//spyOn(console, 'log');
//从条形码获取所购商品列表信息
function listFromTags(allItems, inputs){//先匹配出件数信息。再装入其他
    var  str=new Array();
    str.push({barcode:inputs[0],
            name:" ",
            unit:" ",
            price: 0.00,
            count:1,
            allprice:0.00,
            flag:0
    });
    for(var i=1;i<inputs.length;i++){//1.统计相同的barcode和count
        var flag=0;
        for(var j=0;j<str.length;j++)
        {
            if(str[j].barcode===inputs[i]){
                str[j].count= str[j].count+1;
                flag = 1;
            }
        }
        if(flag===0){
            str.push({barcode:inputs[i],
                name:" ",
                unit:" ",
                price: 0.00,
                count:1,
                allprice:0.00,
                flag:0
            });
        }

    }
    for(var m=0;m<str.length;m++){//特例分割（"-"），备注:用length>1优于用字符普遍个数总数，具有扩展性
        var strs=str[m].barcode.split('-');
        if(strs.length >1 ){
            str[m].barcode=strs[0];
            str[m].count=strs[1];
        }
    }
    for(var k=0;k<str.length;k++){//写入其他value,采用对象先植入后赋值，而不是后期插入对象。后面可以尝试一下采用后期插入对象来进行处理
        for(var l=0;l<allItems.length;l++){
            if(str[k].barcode===allItems[l].barcode){
                str[k].name  = allItems[l].name;
                str[k].unit  = allItems[l].unit;
                str[k].price = (allItems[l].price*100)/100;
                str[k].allprice=((str[k].price*str[k].count)*100)/100;
            }
        }
    }
    //for(var m=0;m<str.length;m++){
    //    console.log("\n----------------------\nbarcode: "+str[m].barcode
    //        + "\nname:"+str[m].name
    //        +"\nunit:"+str[m].unit
    //        +"\nprice:"+str[m].price
    //        +"\ncount:"+str[m].count);
    //}
    //返回barcode,name,unit,price,count
    return str;
}
//匹配符合的促销信息
function  equilToPromotions(promotions,str) {//1.找出参加活动的部分商品，2.计算活动后的价格，3.考虑可扩展性（type）,优化
    var arr = str;
    for (var m = 0; m < promotions.length; m++) {
        if (promotions[m].type === "BUY_TWO_GET_ONE_FREE") {
            for (var i = 0; i < arr.length; i++) {
                for (var j = 0; j < promotions[m].barcodes.length; j++) {
                    if (arr[i].barcode === promotions[m].barcodes[j]){//属于促销范围商品
                         if (arr[i].count >= 2) {
                                arr[i].allprice = arr[i].allprice - arr[i].price * 1;
                                arr[i].flag = 1;
                            }
                     }
                }
            }
        }
    }

    //for(var m=0;m<arr.length;m++){
    //    console.log("\n----------------------\nbarcode: "+arr[m].barcode
    //        + "\nname:"+arr[m].name
    //        +"\nunit:"+arr[m].unit
    //        +"\nprice:"+arr[m].price
    //        +"\ncount:"+arr[m].count
    //        +"\nallprice:"+arr[m].allprice
    //    );
    //}
    return arr;
};//去掉买二送一的价格
function  totalPrice(str){
    var tot=new Array();
    tot.push({Totalprice:0.00,savePrice:0.00});
    for(var i=0;i<str.length;i++){
        tot[0].Totalprice += str[i].allprice;
        if(str[i].flag === 1){
            tot[0].savePrice +=str[i].price;
        }
    }
    return tot;
}

module.exports = function printInventory(inputs) {
    var allItems = loadAllItems();
    var promotions=loadPromotions();
    var arr=listFromTags(allItems,inputs);//调用后可在下方打印购物信息；名称：雪碧，数量：5瓶，单价：3.00(元)，小计：12.00(元)\n'
    var str = equilToPromotions(promotions,arr);//促销活动//console.log(" :"+str[0].allprice);
    var string1 = '***<没钱赚商店>购物清单***\n' ;
    for(var i=0;i<str.length;i++){
        if(i===2){
            string1+='名称：'+str[i].name+'，数量：'+str[i].count+str[i].unit+'，单价：'+str[i].price+'0(元)，小计：'+str[i].allprice+'.00(元)\n'
        }else
        string1+='名称：'+str[i].name+'，数量：'+str[i].count+str[i].unit+'，单价：'+str[i].price+'.00(元)，小计：'+str[i].allprice+'.00(元)\n'
    }

    var string2= '----------------------\n'+ '挥泪赠送商品：\n';
    for(var j=0;j<str.length;j++){
        if(str[j].flag ===1 ){
            string2+= '名称：'+str[j].name+'，数量：'+1+str[j].unit+'\n';
        }
    }

    var str3=totalPrice(str);
    var string3 = '----------------------\n' +
        '总计：'+str3[0].Totalprice+'.00(元)\n' +
        '节省：'+str3[0].savePrice+'0(元)\n'+
         '**********************';
    var string = string1+string2+string3;
    console.log(string);
    return 'Hello World';
};