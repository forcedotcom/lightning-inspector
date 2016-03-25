(function() {
    window.WallTime || (window.WallTime = {});
    window.WallTime.data = {
        rules: {"CA":[{"name":"CA","_from":"1948","_to":"only","type":"-","in":"Mar","on":"14","at":"2:00","_save":"1:00","letter":"D"},{"name":"CA","_from":"1949","_to":"only","type":"-","in":"Jan","on":"1","at":"2:00","_save":"0","letter":"S"},{"name":"CA","_from":"1950","_to":"1966","type":"-","in":"Apr","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"CA","_from":"1950","_to":"1961","type":"-","in":"Sep","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"CA","_from":"1962","_to":"1966","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"}],"US":[{"name":"US","_from":"1918","_to":"1919","type":"-","in":"Mar","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"1918","_to":"1919","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"US","_from":"1942","_to":"only","type":"-","in":"Feb","on":"9","at":"2:00","_save":"1:00","letter":"W"},{"name":"US","_from":"1945","_to":"only","type":"-","in":"Aug","on":"14","at":"23:00u","_save":"1:00","letter":"P"},{"name":"US","_from":"1945","_to":"only","type":"-","in":"Sep","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"US","_from":"1967","_to":"2006","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"US","_from":"1967","_to":"1973","type":"-","in":"Apr","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"1974","_to":"only","type":"-","in":"Jan","on":"6","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"1975","_to":"only","type":"-","in":"Feb","on":"23","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"1976","_to":"1986","type":"-","in":"Apr","on":"lastSun","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"1987","_to":"2006","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"2007","_to":"max","type":"-","in":"Mar","on":"Sun>=8","at":"2:00","_save":"1:00","letter":"D"},{"name":"US","_from":"2007","_to":"max","type":"-","in":"Nov","on":"Sun>=1","at":"2:00","_save":"0","letter":"S"}],"Mexico":[{"name":"Mexico","_from":"1939","_to":"only","type":"-","in":"Feb","on":"5","at":"0:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"1939","_to":"only","type":"-","in":"Jun","on":"25","at":"0:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"1940","_to":"only","type":"-","in":"Dec","on":"9","at":"0:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"1941","_to":"only","type":"-","in":"Apr","on":"1","at":"0:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"1943","_to":"only","type":"-","in":"Dec","on":"16","at":"0:00","_save":"1:00","letter":"W"},{"name":"Mexico","_from":"1944","_to":"only","type":"-","in":"May","on":"1","at":"0:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"1950","_to":"only","type":"-","in":"Feb","on":"12","at":"0:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"1950","_to":"only","type":"-","in":"Jul","on":"30","at":"0:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"1996","_to":"2000","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"1996","_to":"2000","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"2001","_to":"only","type":"-","in":"May","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"2001","_to":"only","type":"-","in":"Sep","on":"lastSun","at":"2:00","_save":"0","letter":"S"},{"name":"Mexico","_from":"2002","_to":"max","type":"-","in":"Apr","on":"Sun>=1","at":"2:00","_save":"1:00","letter":"D"},{"name":"Mexico","_from":"2002","_to":"max","type":"-","in":"Oct","on":"lastSun","at":"2:00","_save":"0","letter":"S"}]},
        zones: {"America/Tijuana":[{"name":"America/Tijuana","_offset":"-7:48:04","_rule":"-","format":"LMT","_until":"1922 Jan 1 0:11:56"},{"name":"America/Tijuana","_offset":"-7:00","_rule":"-","format":"MST","_until":"1924"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"-","format":"PST","_until":"1927 Jun 10 23:00"},{"name":"America/Tijuana","_offset":"-7:00","_rule":"-","format":"MST","_until":"1930 Nov 15"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"-","format":"PST","_until":"1931 Apr 1"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"1:00","format":"PDT","_until":"1931 Sep 30"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"-","format":"PST","_until":"1942 Apr 24"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"1:00","format":"PWT","_until":"1945 Aug 14 23:00u"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"1:00","format":"PPT","_until":"1945 Nov 12"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"-","format":"PST","_until":"1948 Apr 5"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"1:00","format":"PDT","_until":"1949 Jan 14"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"-","format":"PST","_until":"1954"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"CA","format":"P%sT","_until":"1961"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"-","format":"PST","_until":"1976"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"US","format":"P%sT","_until":"1996"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"Mexico","format":"P%sT","_until":"2001"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"US","format":"P%sT","_until":"2002 Feb 20"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"Mexico","format":"P%sT","_until":"2010"},{"name":"America/Tijuana","_offset":"-8:00","_rule":"US","format":"P%sT","_until":""}]}
    };
    window.WallTime.autoinit = true;
}).call(this);
