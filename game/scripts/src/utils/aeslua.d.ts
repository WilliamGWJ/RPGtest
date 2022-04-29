


declare namespace aeslua {
    const AES128 = 16;
    const AES192 = 24;
    const AES256 = 32;
    
    const ECBMODE = 1;
    const CBCMODE = 2;
    const OFBMODE = 3;
    const CFBMODE = 4;
   function decrypt(this:void,password:string, data:any,keyLength:number,mode:number,iv:any): any;
   function encrypt(this:void,password:string, data:any,keyLength:number,mode:number,iv:any): any;
}