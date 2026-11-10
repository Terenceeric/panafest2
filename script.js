/* ============================================================
   PANAFEST PLATFORM — script.js (2027 Enhanced v5)
   All 6 enhancements implemented + 2027 rebrand + advanced notifications
   ============================================================ */
'use strict';

/* ============================================================
   1. LOCAL DATA STORE
   ============================================================ */
const DB = {
    _keys: ['users','programs','events','tickets','accommodations','bookings','vendors','products','media','heritage','diasporaGroups','diasporaPosts','diasporaMessages','diasporaFollows','directory','feedback','donations','programRegistrations','transactions'],
    users:[], programs:[], events:[], tickets:[], accommodations:[], bookings:[], vendors:[], products:[], media:[], heritage:[], diasporaGroups:[], diasporaPosts:[], diasporaMessages:[], diasporaFollows:[], directory:[], feedback:[], donations:[], programRegistrations:[], transactions:[],

    load(){ this._keys.forEach(k=>{try{const r=localStorage.getItem('panafest_'+k);this[k]=r?JSON.parse(r):[];}catch{this[k]=[];}}); },
    save(c){try{localStorage.setItem('panafest_'+c,JSON.stringify(this[c]));}catch(e){console.warn('Save failed:',e);}window.dispatchEvent(new CustomEvent('db:updated',{detail:{collection:c}}));},
    add(c,item){item.id=item.id||`${c}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;this[c].push(item);this.save(c);return item;},
    update(c,id,changes){const i=this[c].findIndex(x=>x.id===id);if(i>=0){this[c][i]={...this[c][i],...changes};this.save(c);return this[c][i];}return null;},
    remove(c,id){this[c]=this[c].filter(x=>x.id!==id);this.save(c);},
    find(c,id){return this[c].find(x=>x.id===id);},

    seedIfEmpty(){
        const VERSION='v5';
        const cur=localStorage.getItem('panafest_seed_version');
        const d=(n,h=9)=>{const dt=new Date();dt.setDate(dt.getDate()+n);dt.setHours(h,0,0,0);return dt.toISOString().slice(0,16);};

        if(cur!==VERSION){
            // Reset content collections only (keep users, tickets, bookings, transactions, donations, feedback, programRegistrations)
            this.programs=[];this.events=[];this.heritage=[];this.diasporaGroups=[];this.diasporaPosts=[];this.directory=[];this.accommodations=[];this.vendors=[];this.products=[];this.media=[];this.diasporaMessages=[];this.diasporaFollows=[];
            ['programs','events','heritage','diasporaGroups','diasporaPosts','directory','accommodations','vendors','products','media','diasporaMessages','diasporaFollows'].forEach(k=>this.save(k));
            localStorage.setItem('panafest_seed_version',VERSION);
        }

        // Migrate old feedback items to new schema
        this.feedback=this.feedback.map(f=>{
            if(f.subject&&!f.description){
                return{...f,description:f.message||f.subject,location:'',overallStatus:f.status||'pending',submittedAt:f.createdAt||new Date().toISOString(),updatedAt:f.createdAt||new Date().toISOString(),acknowledgedBy:null,acknowledgedAt:null,estimatedFixTime:null,updates:[],userEmail:f.userEmail||''};
            }
            return f;
        });

        if(this.programs.length===0){
            [
                {title:'Return Journey & Akwaaba Ceremony',category:'Ceremony',date:d(0,9),venue:'Cape Coast Castle',description:'Official welcome ceremony for returnees and visiting delegations.',individualPrice:50,groupPrice:250,image:placeholderImage('Akwaaba','#FFD700','#B8860B'),videos:['https://www.youtube.com/embed/5qap5aO4i9A']},
                {title:'PANAFEST Village / Bazaar / Expo',category:'Bazaar',date:d(0,14),venue:'PANAFEST Village',description:'Vibrant marketplace of African crafts, food, fashion.',individualPrice:30,groupPrice:150,image:placeholderImage('Bazaar','#DAA520','#8a6510'),videos:[]},
                {title:'World of the African Child',category:'Youth',date:d(1,10),venue:'Elmina Community Center',description:'Celebrating the future generation through arts and education.',individualPrice:25,groupPrice:120,image:placeholderImage('African Child','#4ade80','#16a34a'),videos:[]},
                {title:'Colloquiums & Conferences',category:'Conference',date:d(1,9),venue:'University of Cape Coast',description:'Academic dialogues on Pan-Africanism and development.',individualPrice:100,groupPrice:400,image:placeholderImage('Colloquium','#3b82f6','#1d4ed8'),videos:[]},
                {title:'Youth Day',category:'Youth',date:d(2,10),venue:'Cape Coast Sports Stadium',description:'Sports, performances, and youth empowerment activities.',individualPrice:20,groupPrice:100,image:placeholderImage('Youth Day','#ffbb4a','#cc8800'),videos:[]},
                {title:"Women's Day",category:'Special',date:d(3,10),venue:'Elmina Beach Resort',description:'Celebrating African women in leadership and culture.',individualPrice:80,groupPrice:350,image:placeholderImage("Women's Day",'#ff4d9a','#cc3377'),videos:[]},
                {title:'Art & Creative Exhibitions',category:'Exhibition',date:d(3,15),venue:'Centre for National Culture',description:'Contemporary African art from across the continent.',individualPrice:40,groupPrice:180,image:placeholderImage('Art Exhibition','#b96bff','#8844cc'),videos:[]},
                {title:'Reverential Night',category:'Ceremony',date:d(4,19),venue:'Cape Coast Castle',description:'A night of reflection, candlelight, and remembrance.',individualPrice:60,groupPrice:300,image:placeholderImage('Reverential Night','#1a1505','#B8860B'),videos:[]},
                {title:'Interfaith Program',category:'Ceremony',date:d(5,9),venue:'Elmina Castle',description:'Interfaith prayers for unity across the continent.',individualPrice:0,groupPrice:0,image:placeholderImage('Interfaith','#DAA520','#8a6510'),videos:[]},
                {title:'Workshops & Masterclasses',category:'Workshop',date:d(5,10),venue:'Various Venues',description:'Hands-on sessions with master artists and scholars.',individualPrice:150,groupPrice:500,image:placeholderImage('Masterclass','#ffd700','#8a6510'),videos:[]}
            ].forEach(p=>this.add('programs',p));
        }

        if(this.events.length===0){
            [
                {title:'Akwaaba Ceremony',date:d(0,9),venue:'Cape Coast Castle',description:'Opening welcome for returnees.'},
                {title:'Grand Durbar of Chiefs',date:d(0,13),venue:'Victoria Park',description:'Traditional chiefs procession.'},
                {title:'Opening Concert',date:d(0,19),venue:'Cape Coast Stadium',description:'Pan-African musical performances.'},
                {title:'Bazaar Opening',date:d(1,10),venue:'PANAFEST Village',description:'Marketplace opens to public.'},
                {title:'Cultural Performance',date:d(1,14),venue:'PANAFEST Village',description:'Traditional dance showcase.'},
                {title:'Evening Showcase',date:d(1,19),venue:'Cape Coast Castle',description:'Live music and storytelling.'},
                {title:'Youth Sports Festival',date:d(2,8),venue:'Cape Coast Stadium',description:'Athletics and traditional games.'},
                {title:'Youth Forum',date:d(2,14),venue:'UCC Auditorium',description:'Panel discussion with young leaders.'},
                {title:'Youth Concert',date:d(2,19),venue:'Cape Coast Stadium',description:'Youth-driven musical showcase.'},
                {title:"Women's Forum",date:d(3,9),venue:'Elmina Beach Resort',description:'Empowerment panel.'},
                {title:'Art Exhibition Opening',date:d(3,15),venue:'Centre for National Culture',description:'Contemporary African art.'},
                {title:'Reverential Procession',date:d(3,19),venue:'Cape Coast Castle',description:'Candlelight walk.'},
                {title:'Reverential Night',date:d(4,20),venue:'Cape Coast Castle',description:'Vigil and remembrance.'},
                {title:'Sunrise Ceremony',date:d(5,6),venue:'Elmina Castle',description:'Dawn prayers.'},
                {title:'Interfaith Dialogue',date:d(5,9),venue:'Elmina Castle',description:'Interfaith leaders unite.'}
            ].forEach(e=>this.add('events',e));
        }

        if(this.accommodations.length===0){
            [
                {name:'Cape Coast Beach Resort',type:'Resort',location:'Cape Coast',price:850,rooms:40,contact:'+233241111111',description:'Beachfront luxury with ocean views.',image:placeholderImage('Beach Resort','#4ade80','#16a34a'),gallery:[placeholderImage('Room 1','#4ade80','#16a34a'),placeholderImage('Room 2','#22c55e','#15803d')],videos:['https://www.youtube.com/embed/5qap5aO4i9A']},
                {name:'Elmina Heritage Hotel',type:'Hotel',location:'Elmina',price:620,rooms:25,contact:'+233242222222',description:'Historic hotel near Elmina Castle.',image:placeholderImage('Heritage Hotel','#FFD700','#B8860B'),gallery:[placeholderImage('Suite','#FFD700','#B8860B')],videos:[]},
                {name:'Kotokuraba Guesthouse',type:'Guesthouse',location:'Cape Coast',price:280,rooms:15,contact:'+233243333333',description:'Cozy guesthouse in heart of Cape Coast.',image:placeholderImage('Guesthouse','#b96bff','#8844cc'),gallery:[],videos:[]},
                {name:'Anomabo Homestay',type:'Homestay',location:'Anomabo',price:150,rooms:8,contact:'+233244444444',description:'Authentic local homestay experience.',image:placeholderImage('Homestay','#ffbb4a','#cc8800'),gallery:[],videos:[]}
            ].forEach(a=>this.add('accommodations',a));
        }

        if(this.vendors.length===0){
            [
                {name:'Ashanti Kente Weavers',owner:'Kwame Asante',category:'Textiles',contact:'+233205555555',description:'Authentic handwoven kente.',image:placeholderImage('Kente Weavers','#FFD700','#8a6510')},
                {name:'Sahel Crafts Emporium',owner:'Fatima Diallo',category:'Crafts',contact:'+233206666666',description:'Handcrafted African crafts.',image:placeholderImage('Sahel Crafts','#b96bff','#8844cc')},
                {name:'Accra Fashion Collective',owner:'Ama Mensah',category:'Fashion',contact:'+233207777777',description:'Contemporary African fashion.',image:placeholderImage('Fashion','#ff4d9a','#cc3377')}
            ].forEach(v=>this.add('vendors',v));
        }

        if(this.products.length===0){
            const v=this.vendors;
            [
                {title:'Handwoven Kente Cloth',description:'Authentic Ashanti kente, hand-woven.',category:'Textiles',price:450,contact:'+233205555555',sellerName:'Ashanti Kente Weavers',sellerId:v[0]?.id,vendorId:v[0]?.id,status:'approved',image:placeholderImage('Kente Cloth','#FFD700','#B8860B'),createdAt:new Date(Date.now()-5*86400000).toISOString()},
                {title:'Beaded Necklace Set',description:'Handcrafted Ghanaian beads.',category:'Crafts',price:120,contact:'+233206666666',sellerName:'Sahel Crafts Emporium',sellerId:v[1]?.id,vendorId:v[1]?.id,status:'approved',image:placeholderImage('Necklace','#b96bff','#8844cc'),createdAt:new Date(Date.now()-3*86400000).toISOString()},
                {title:'Adinkra Print Shirt',description:'Modern menswear with Adinkra symbols.',category:'Fashion',price:180,contact:'+233207777777',sellerName:'Accra Fashion Collective',sellerId:v[2]?.id,vendorId:v[2]?.id,status:'approved',image:placeholderImage('Adinkra Shirt','#ff4d9a','#cc3377'),createdAt:new Date(Date.now()-1*86400000).toISOString()},
                {title:'Brass Ashanti Mask',description:'Decorative brass mask.',category:'Art',price:320,contact:'+233206666666',sellerName:'Sahel Crafts Emporium',sellerId:v[1]?.id,vendorId:v[1]?.id,status:'approved',image:placeholderImage('Brass Mask','#DAA520','#8a6510'),createdAt:new Date(Date.now()-2*86400000).toISOString()}
            ].forEach(p=>this.add('products',p));
        }

        if(this.directory.length===0){
            [
                {name:'Prof. Wole Soyinka',role:'Speaker',country:'Nigeria',genre:'Literature',bio:'Nobel Laureate and Pan-African cultural icon.',image:placeholderImage('Wole Soyinka','#DAA520','#8a6510'),videos:['https://www.youtube.com/embed/5qap5aO4i9A'],music:[]},
                {name:'Angelique Kidjo',role:'Performer',country:'Benin',genre:'Afro-Pop',bio:'Grammy-winning singer and activist.',image:placeholderImage('Angelique Kidjo','#ff4d9a','#cc3377'),videos:['https://www.youtube.com/embed/5qap5aO4i9A'],music:[]},
                {name:'Dr. Molefi Kete Asante',role:'Speaker',country:'USA',genre:'Africology',bio:'Founder of Afrocentricity theory.',image:placeholderImage('Molefi Asante','#3b82f6','#1d4ed8'),videos:[],music:[]}
            ].forEach(d=>this.add('directory',d));
        }

        if(this.heritage.length===0){
            [
                {category:'PANAFEST History',title:'The Birth of PANAFEST',description:'How PANAFEST began in 1992 as a Pan-African cultural movement to unite Africa and its diaspora.',url:''},
                {category:'PANAFEST History',title:'Founders & Vision',description:'The visionaries who brought PANAFEST to life.',url:''},
                {category:'PANAFEST History',title:'Impact Over the Years',description:'Three decades of cultural reunification and celebration.',url:''},
                {category:'African History',title:'Great African Kingdoms',description:'Overview of Ghana, Mali, Songhai empires and other great civilizations.',url:''},
                {category:'African History',title:'Transatlantic Slave Trade',description:'Understanding the impact and legacy of the slave trade.',url:''},
                {category:'African History',title:'Pan-Africanism Movement',description:'The intellectual and political movement uniting Africa and its diaspora.',url:''},
                {category:'Documentaries',title:'Return Journey',description:'Award-winning documentary following diaspora returnees to Ghana.',url:''},
                {category:'Documentaries',title:'Voices of the Diaspora',description:'Stories from African descendants around the world.',url:''},
                {category:'Documentaries',title:'The Door of No Return',description:'A haunting exploration of Cape Coast Castle history.',url:''},
                {category:'Museum',title:'Digital Museum Tour - Cape Coast Castle',description:'Virtual exploration of the historic Cape Coast Castle.',url:''},
                {category:'Museum',title:'Digital Museum Tour - Elmina Castle',description:'Virtual exploration of Elmina Castle, oldest European building in Africa.',url:''},
                {category:'Museum',title:'Ashanti Royal Regalia',description:'Explore the treasures of the Ashanti kingdom.',url:''},
                {category:'Masterclasses',title:'African Drumming Masterclass',description:'Learn traditional rhythms from master drummers.',url:''},
                {category:'Masterclasses',title:'Kente Weaving Workshop',description:'Hands-on session with master weavers.',url:''},
                {category:'Masterclasses',title:'African Storytelling',description:'Master the art of oral tradition and narrative.',url:''}
            ].forEach(h=>this.add('heritage',h));
        }

        if(this.diasporaGroups.length===0){
            [
                {name:'USA Chapter',description:'Connecting PANAFEST attendees from the United States.'},
                {name:'Caribbean Chapter',description:'Voices from across the Caribbean islands.'},
                {name:'UK Diaspora',description:'Community of PANAFEST supporters in the United Kingdom.'},
                {name:'Brazil Connection',description:'Afro-Brazilian participants and supporters.'},
                {name:'Canada Chapter',description:'Diaspora community in Canada.'}
            ].forEach(g=>this.add('diasporaGroups',g));
        }

        if(this.diasporaPosts.length===0){
            const groups=this.diasporaGroups;
            [
                {groupName:'USA Chapter',authorName:'Kwame Asante',content:'Looking forward to my first PANAFEST! Traveling from Atlanta. Who else is coming?',createdAt:new Date(Date.now()-2*86400000).toISOString()},
                {groupName:'Brazil Connection',authorName:'Maria Santos',content:'Brazil will be well represented this year! Vamos celebrar a África unida!',createdAt:new Date(Date.now()-1*86400000).toISOString()},
                {groupName:'UK Diaspora',authorName:'Akua Mensah',content:'Just booked my tickets. Can\'t wait to reconnect with my roots in Cape Coast.',createdAt:new Date(Date.now()-6*3600000).toISOString()},
                {groupName:'Caribbean Chapter',authorName:'David Thompson',content:'Jamaica is coming strong this year! One Africa, one people.',createdAt:new Date(Date.now()-3*3600000).toISOString()}
            ].forEach(p=>this.add('diasporaPosts',p));
        }
    }
};

/* ============================================================
   2. HELPERS
   ============================================================ */
function placeholderImage(label,c1='#FFD700',c2='#B8860B'){
    const safe=String(label||'PANAFEST').replace(/[<>&"]/g,'');
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><text x="300" y="215" text-anchor="middle" fill="white" font-family="sans-serif" font-size="32" font-weight="bold">${safe}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
window.placeholderImage=placeholderImage;

function fileToCompressedDataUrl(file,maxDim=500,quality=0.7){
    return new Promise((resolve,reject)=>{
        if(!file){resolve(null);return;}
        const reader=new FileReader();
        reader.onload=e=>{
            const img=new Image();
            img.onload=()=>{
                let w=img.width,h=img.height;
                if(w>maxDim||h>maxDim){const r=Math.min(maxDim/w,maxDim/h);w=Math.round(w*r);h=Math.round(h*r);}
                const canvas=document.createElement('canvas');
                canvas.width=w;canvas.height=h;
                canvas.getContext('2d').drawImage(img,0,0,w,h);
                resolve(canvas.toDataURL('image/jpeg',quality));
            };
            img.onerror=reject;
            img.src=e.target.result;
        };
        reader.onerror=reject;
        reader.readAsDataURL(file);
    });
}
window.fileToCompressedDataUrl=fileToCompressedDataUrl;

DB.load();
DB.seedIfEmpty();

/* ============================================================
   3. AUTH
   ============================================================ */
const CANONICAL_ADMIN_EMAIL='admin@panafest.org.gh';
const CANONICAL_ADMIN_PASSWORD='panafest2027admin';

const AUTH={
    current:null,profile:null,
    async register(data){
        const email=String(data.email||'').trim().toLowerCase();
        if(DB.users.some(u=>(u.email||'').toLowerCase()===email))throw new Error('An account with this email already exists.');
        const user={id:'user-'+Date.now(),name:data.name,email,password:data.password,phone:data.phone,country:data.country,gender:data.gender,category:data.category,extras:data.extras||{},role:'customer',status:'active',createdAt:new Date().toISOString()};
        DB.add('users',user);
        this.current={id:user.id,email:user.email,role:'customer'};
        this.profile=user;
        sessionStorage.setItem('panafest_user',JSON.stringify(this.current));
        sessionStorage.setItem('panafest_profile',JSON.stringify(this.profile));
        return user;
    },
    async login(email,password){
        email=String(email||'').trim().toLowerCase();
        const user=DB.users.find(u=>(u.email||'').toLowerCase()===email);
        if(!user)throw new Error('No account found with this email.');
        if(user.password!==password)throw new Error('Incorrect password.');
        if(user.status==='suspended')throw new Error('Your account is suspended.');
        if(user.role==='admin')throw new Error('Please use Admin Login.');
        this.current={id:user.id,email:user.email,role:user.role};
        this.profile=user;
        sessionStorage.setItem('panafest_user',JSON.stringify(this.current));
        sessionStorage.setItem('panafest_profile',JSON.stringify(this.profile));
        return user;
    },
    async adminLogin(email,password){
        email=String(email||'').trim().toLowerCase();password=String(password||'');
        if(email===CANONICAL_ADMIN_EMAIL){
            let admin=DB.users.find(u=>(u.email||'').toLowerCase()===CANONICAL_ADMIN_EMAIL);
            if(!admin){admin={id:'admin-1',name:'PANAFEST Administrator',email:CANONICAL_ADMIN_EMAIL,password:CANONICAL_ADMIN_PASSWORD,role:'admin',category:'admin',status:'active',createdAt:new Date().toISOString()};DB.add('users',admin);}
            else if(admin.password!==CANONICAL_ADMIN_PASSWORD||admin.role!=='admin'){admin=DB.update('users',admin.id,{password:CANONICAL_ADMIN_PASSWORD,role:'admin',status:'active'});}
            if(password!==CANONICAL_ADMIN_PASSWORD)throw new Error('Incorrect admin password. Demo password: panafest2027admin');
            this.current={id:admin.id,email:admin.email,role:'admin'};
            this.profile=admin;
            sessionStorage.setItem('panafest_user',JSON.stringify(this.current));
            sessionStorage.setItem('panafest_profile',JSON.stringify(this.profile));
            return admin;
        }
        const user=DB.users.find(u=>(u.email||'').toLowerCase()===email);
        if(!user||user.password!==password)throw new Error('Invalid credentials.');
        if(user.role!=='admin')throw new Error('This account is not an administrator.');
        this.current={id:user.id,email:user.email,role:'admin'};
        this.profile=user;
        sessionStorage.setItem('panafest_user',JSON.stringify(this.current));
        sessionStorage.setItem('panafest_profile',JSON.stringify(this.profile));
        return user;
    },
    logout(){this.current=null;this.profile=null;sessionStorage.removeItem('panafest_user');sessionStorage.removeItem('panafest_profile');},
    restore(){try{const u=sessionStorage.getItem('panafest_user'),p=sessionStorage.getItem('panafest_profile');if(u&&p){this.current=JSON.parse(u);this.profile=JSON.parse(p);return true;}}catch{}return false;},
    updateProfile(changes){if(!this.profile)return;const u=DB.update('users',this.profile.id,changes)||{...this.profile,...changes};this.profile=u;sessionStorage.setItem('panafest_profile',JSON.stringify(u));return u;}
};

/* ============================================================
   4. UI HELPERS
   ============================================================ */
window.togglePasswordVisibility=function(id,btn){const inp=document.getElementById(id);if(!inp)return;const i=btn.querySelector('i');if(inp.type==='password'){inp.type='text';i.classList.replace('fa-eye','fa-eye-slash');}else{inp.type='password';i.classList.replace('fa-eye-slash','fa-eye');}};

function notify(msg,type='info'){const div=document.createElement('div');const bg=type==='success'?'var(--success-glow)':type==='error'?'var(--danger-glow)':'var(--gold-primary)';div.style.cssText=`position:fixed;top:20px;right:20px;padding:12px 24px;border-radius:50px;font-weight:600;z-index:10000;color:#0a0a0f;background:${bg};box-shadow:0 4px 20px rgba(0,0,0,0.4);max-width:90vw;`;div.textContent=msg;document.body.appendChild(div);setTimeout(()=>div.remove(),3500);}
window.notify=notify;

function showLoading(btn=null){document.getElementById('loadingOverlay')?.classList.add('active');document.body.classList.add('loading-active');if(btn){btn.disabled=true;btn.dataset.original=btn.innerHTML;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> WORKING...';}}
function hideLoading(btn=null){document.getElementById('loadingOverlay')?.classList.remove('active');document.body.classList.remove('loading-active');if(btn){btn.disabled=false;if(btn.dataset.original)btn.innerHTML=btn.dataset.original;}}
async function withLoading(fn,btn,successMsg,errorMsg){showLoading(btn);try{const r=await fn();if(successMsg)notify(successMsg,'success');return r;}catch(e){console.error(e);notify(errorMsg||e.message||'Operation failed','error');throw e;}finally{hideLoading(btn);}}

function esc(s){if(s===undefined||s===null)return '';return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
window.esc=esc;

function confirmAction(message){return new Promise(resolve=>{document.getElementById('confirmMessage').textContent=message;const modal=document.getElementById('confirmModal');modal.style.display='flex';const yes=document.getElementById('confirmYesBtn'),no=document.getElementById('confirmNoBtn');const done=v=>{modal.style.display='none';yes.removeEventListener('click',onYes);no.removeEventListener('click',onNo);resolve(v);};const onYes=()=>done(true),onNo=()=>done(false);yes.addEventListener('click',onYes);no.addEventListener('click',onNo);});}

/* ============================================================
   5. DETAIL PAGE ROUTING
   ============================================================ */
window.showDetailPage=function(html){document.getElementById('menuPage').style.display='none';document.getElementById('moduleContainer').style.display='none';document.getElementById('detailPageContainer').style.display='block';document.getElementById('detailPageContent').innerHTML=html;document.body.classList.add('module-open');window.scrollTo(0,0);};

window.closeDetailPage=function(){document.getElementById('detailPageContainer').style.display='none';document.getElementById('detailPageContent').innerHTML='';const activeModule=document.querySelector('.module-content[style*="display: block"]');if(activeModule){document.getElementById('moduleContainer').style.display='block';}else{document.getElementById('menuPage').style.display='block';document.body.classList.remove('module-open');}window.scrollTo(0,0);};

/* ============================================================
   6. AUTH FORM NAVIGATION
   ============================================================ */
window.showLoginForm=function(){document.querySelectorAll('.auth-form').forEach(f=>f.classList.remove('active'));document.getElementById('loginForm').classList.add('active');};
window.showAdminLoginForm=function(){document.querySelectorAll('.auth-form').forEach(f=>f.classList.remove('active'));document.getElementById('adminLoginForm').classList.add('active');};
window.showRegisterForm=function(){document.querySelectorAll('.auth-form').forEach(f=>f.classList.remove('active'));document.getElementById('registerForm').classList.add('active');window.showCategoryPicker();};

/* ============================================================
   7. CATEGORY PICKER
   ============================================================ */
const CATEGORY_META={
    attendee:{label:'Attendee',icon:'fa-user-friends',gradient:'linear-gradient(135deg, #FFD700, #DAA520)'},
    participant:{label:'Participant',icon:'fa-flag',gradient:'linear-gradient(135deg, #b96bff, #8844cc)'},
    artist:{label:'Artist/Performer',icon:'fa-music',gradient:'linear-gradient(135deg, #ff4d9a, #cc3377)'},
    vendor:{label:'Vendor/Exhibitor',icon:'fa-store',gradient:'linear-gradient(135deg, #ffbb4a, #cc8800)'},
    hotelier:{label:'Hotelier',icon:'fa-hotel',gradient:'linear-gradient(135deg, #4ade80, #16a34a)'},
    tourgroup:{label:'Tour Group',icon:'fa-plane',gradient:'linear-gradient(135deg, #3b82f6, #1d4ed8)'},
    media:{label:'Media Personnel',icon:'fa-newspaper',gradient:'linear-gradient(135deg, #ef4444, #b91c1c)'}
};
let selectedCategory=null;

function renderCategoryIcons(){const grid=document.getElementById('categoryIconsGrid');if(!grid)return;grid.innerHTML=Object.entries(CATEGORY_META).map(([key,meta])=>`<button type="button" class="category-icon" data-category="${key}" onclick="selectCategory('${key}')"><div class="category-icon-tile" style="background:${meta.gradient};"><i class="fas ${meta.icon}"></i></div><span class="category-icon-label">${meta.label}</span></button>`).join('');}

window.showCategoryPicker=function(){selectedCategory=null;document.getElementById('regCategoryPicker').style.display='block';document.getElementById('regFormContent').style.display='none';document.getElementById('regCategoryFields').innerHTML='';renderCategoryIcons();};

window.selectCategory=function(cat){if(!CATEGORY_META[cat])return;selectedCategory=cat;document.getElementById('regCategoryPicker').style.display='none';document.getElementById('regFormContent').style.display='block';const meta=CATEGORY_META[cat];document.getElementById('regSelectedHeader').innerHTML=`<div class="selected-category-banner" style="background:${meta.gradient};"><i class="fas ${meta.icon}"></i><span>Registering as <strong>${meta.label}</strong></span></div>`;const t=categoryFieldTemplates[cat];document.getElementById('regCategoryFields').innerHTML=t?t():'';};

const categoryFieldTemplates={
    attendee:()=>`<div class="form-group"><label><i class="fas fa-users"></i> Number of Attendees</label><input type="number" id="regAttendees" min="1" value="1"></div>`,
    participant:()=>`<div class="form-group"><label><i class="fas fa-flag"></i> Participant Type</label><select id="regParticipantType"><option>Individual</option><option>Delegation</option><option>Institution</option></select></div>`,
    artist:()=>`<div class="form-group"><label><i class="fas fa-music"></i> Art Form</label><input type="text" id="regArtForm" placeholder="Music, Dance, Theatre..." required></div><div class="form-group"><label><i class="fas fa-link"></i> Portfolio</label><input type="url" id="regPortfolio"></div>`,
    vendor:()=>`<div class="form-group"><label><i class="fas fa-store"></i> Business Name</label><input type="text" id="regBusiness" required></div><div class="form-group"><label><i class="fas fa-box"></i> Product Category</label><input type="text" id="regProductCategory" required></div>`,
    hotelier:()=>`<div class="form-group"><label><i class="fas fa-hotel"></i> Property Name</label><input type="text" id="regProperty" required></div><div class="form-group"><label><i class="fas fa-bed"></i> Rooms Available</label><input type="number" id="regRooms" min="1" required></div>`,
    tourgroup:()=>`<div class="form-group"><label><i class="fas fa-plane"></i> Group Name</label><input type="text" id="regGroupName" required></div><div class="form-group"><label><i class="fas fa-users"></i> Group Size</label><input type="number" id="regGroupSize" min="1" required></div>`,
    media:()=>`<div class="form-group"><label><i class="fas fa-newspaper"></i> Media Outlet</label><input type="text" id="regOutlet" required></div><div class="form-group"><label><i class="fas fa-id-badge"></i> Press Card / ID</label><input type="text" id="regPressId"></div>`
};

/* ============================================================
   8. MENU
   ============================================================ */
const customerMenu=[
    {id:'myRegistrationModule',icon:'fa-id-card',title:'My Registration',desc:'Profile & status'},
    {id:'programsModule',icon:'fa-calendar-alt',title:'Programs',desc:'All PANAFEST programs'},
    {id:'eventScheduleModule',icon:'fa-clock',title:'Event Schedule',desc:'Multiple events per day'},
    {id:'ticketingModule',icon:'fa-ticket-alt',title:'Ticketing',desc:'Buy & view tickets'},
    {id:'accommodationModule',icon:'fa-hotel',title:'Accommodation',desc:'Book a stay'},
    {id:'marketplaceModule',icon:'fa-store',title:'Marketplace',desc:'Crafts · Shops'},
    {id:'mediaCenterModule',icon:'fa-photo-video',title:'Media Center',desc:'Photos · Videos'},
    {id:'heritageModule',icon:'fa-landmark',title:'Heritage Center',desc:'Learn African history'},
    {id:'diasporaModule',icon:'fa-globe-africa',title:'Diaspora Hub',desc:'Connect & discuss'},
    {id:'directoryModule',icon:'fa-microphone-alt',title:'Speakers & Artists',desc:'Featured profiles'},
    {id:'feedbackModule',icon:'fa-clipboard-list',title:'Complaints & Feedback',desc:'Report issues & feedback'},
    {id:'donationsModule',icon:'fa-hand-holding-heart',title:'Donations',desc:'Support PANAFEST'}
];
const adminMenu=[
    {id:'adminUsersModule',icon:'fa-users-cog',title:'Users',desc:'Categories & management'},
    {id:'adminProgramsModule',icon:'fa-calendar-plus',title:'Programs',desc:'CRUD + registrations'},
    {id:'adminEventScheduleModule',icon:'fa-clock',title:'Event Schedule',desc:'Manage daily events'},
    {id:'adminTicketsModule',icon:'fa-ticket-alt',title:'Tickets',desc:'Tickets & transactions'},
    {id:'adminAccommodationModule',icon:'fa-hotel',title:'Accommodation',desc:'Hotels & bookings'},
    {id:'adminMarketplaceModule',icon:'fa-store',title:'Marketplace',desc:'Vendors & products'},
    {id:'adminMediaModule',icon:'fa-photo-video',title:'Media',desc:'Photos/Videos/Press'},
    {id:'adminDirectoryModule',icon:'fa-microphone-alt',title:'Speakers & Artists',desc:'Profiles'},
    {id:'adminHeritageModule',icon:'fa-landmark',title:'Heritage Center',desc:'Manage content'},
    {id:'adminComplaintsModule',icon:'fa-clipboard-list',title:'Complaints',desc:'Ghartey-style management'},
    {id:'adminReportsModule',icon:'fa-chart-line',title:'Reports',desc:'Analytics'}
];

function renderMenuGrid(){const grid=document.getElementById('menuGrid');if(!grid)return;const menu=AUTH.current?.role==='admin'?adminMenu:customerMenu;grid.innerHTML=menu.map(m=>`<div class="menu-card" data-module="${m.id}"><i class="fas ${m.icon}"></i><h3>${m.title}</h3><p>${m.desc}</p></div>`).join('');grid.querySelectorAll('.menu-card').forEach(card=>{card.addEventListener('click',()=>window.navigateToModule(card.dataset.module));});}

function showMenuPage(){document.getElementById('menuPage').style.display='block';document.getElementById('moduleContainer').style.display='none';document.getElementById('detailPageContainer').style.display='none';document.body.classList.remove('module-open');}
window.showMenuPage=showMenuPage;

/* ============================================================
   9. MODULE ROUTER
   ============================================================ */
window.navigateToModule=function(moduleId){
    document.getElementById('menuPage').style.display='none';
    document.getElementById('detailPageContainer').style.display='none';
    document.getElementById('moduleContainer').style.display='block';
    document.body.classList.add('module-open');
    window.scrollTo(0,0);
    document.querySelectorAll('.module-content').forEach(m=>m.style.display='none');
    const target=document.getElementById(moduleId);
    if(target)target.style.display='block';

    switch(moduleId){
        case 'myRegistrationModule':renderMyRegistration();break;
        case 'programsModule':renderPrograms();break;
        case 'eventScheduleModule':renderEventSchedule();break;
        case 'ticketingModule':renderTicketing();break;
        case 'accommodationModule':renderAccommodation();break;
        case 'marketplaceModule':initMarketplace();break;
        case 'mediaCenterModule':renderMediaCenter('photos');break;
        case 'heritageModule':renderHeritage();break;
        case 'diasporaModule':initDiaspora();break;
        case 'directoryModule':renderDirectory();break;
        case 'feedbackModule':initCustomerComplaints();break;
        case 'donationsModule':renderMyDonations();break;
        case 'adminUsersModule':initAdminUsers();break;
        case 'adminProgramsModule':renderAdminPrograms();renderAdminProgramRegistrations();break;
        case 'adminEventScheduleModule':renderAdminEventSchedule();break;
        case 'adminTicketsModule':renderAdminTickets();renderAdminTransactions();break;
        case 'adminAccommodationModule':renderAdminAccommodation();renderAdminBookings();break;
        case 'adminMarketplaceModule':renderAdminMarketplace();break;
        case 'adminMediaModule':renderAdminMedia();break;
        case 'adminDirectoryModule':renderAdminDirectory();break;
        case 'adminHeritageModule':renderAdminHeritage();break;
        case 'adminComplaintsModule':initAdminComplaints();break;
        case 'adminReportsModule':renderAdminReports();break;
    }
};

/* ============================================================
   10. CUSTOMER: MY REGISTRATION
   ============================================================ */
function renderMyRegistration(){
    const p=AUTH.profile;if(!p)return;
    document.getElementById('regStatusBanner').innerHTML=`<div class="glass-panel" style="background:rgba(255,215,0,0.08); border-color:var(--gold-primary); padding:14px 18px; margin-bottom:16px;"><p><i class="fas fa-check-circle" style="color:var(--gold-primary);"></i> <strong>Status:</strong> <span class="status-badge status-success">${esc((p.status||'active').toUpperCase())}</span> · Category: <strong>${esc((p.category||'').toUpperCase())}</strong></p></div>`;
    const extrasRows=p.extras?Object.entries(p.extras).filter(([k,v])=>v&&v!=='').map(([k,v])=>`<div class="profile-row"><span>${esc(k.replace(/^reg/,''))}</span><span>${esc(v)}</span></div>`).join(''):'';
    document.getElementById('regProfileView').innerHTML=`
        <div class="profile-card">
            <div class="profile-row"><span>Full Name</span><span>${esc(p.name)}</span></div>
            <div class="profile-row"><span>Email</span><span>${esc(p.email)}</span></div>
            <div class="profile-row"><span>Phone</span><span>${esc(p.phone)}</span></div>
            <div class="profile-row"><span>Country</span><span>${esc(p.country)}</span></div>
            <div class="profile-row"><span>Gender</span><span>${esc(p.gender)}</span></div>
            <div class="profile-row"><span>Category</span><span>${esc(p.category)}</span></div>
            ${extrasRows}
        </div>
        <div style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap;">
            <button class="auth-btn" style="flex:1; min-width:180px;" onclick="editProfile()"><i class="fas fa-edit"></i> EDIT PROFILE</button>
            <button class="auth-btn" style="flex:1; min-width:180px; background:var(--success-glow); color:#0a0a0f;" onclick="downloadQRBadge()"><i class="fas fa-qrcode"></i> DOWNLOAD QR ID</button>
        </div>
        <div id="qrBadgeContainer" style="margin-top:20px; display:none; text-align:center;"></div>`;
}
window.editProfile=function(){
    const p=AUTH.profile;if(!p)return;
    document.getElementById('regProfileView').innerHTML=`<form id="editProfileForm" class="admin-form"><div class="form-group"><label>Full Name</label><input type="text" id="epName" value="${esc(p.name)}" required></div><div class="form-group"><label>Phone</label><input type="tel" id="epPhone" value="${esc(p.phone)}" required></div><div class="form-group"><label>Country</label><input type="text" id="epCountry" value="${esc(p.country)}" required></div><div class="form-group"><label>Gender</label><select id="epGender"><option ${p.gender==='Male'?'selected':''}>Male</option><option ${p.gender==='Female'?'selected':''}>Female</option><option ${p.gender==='Other'?'selected':''}>Other</option></select></div><div class="form-row" style="display:flex; gap:10px;"><button type="submit" class="auth-btn">SAVE CHANGES</button><button type="button" class="auth-btn" style="background:transparent; border:1px solid var(--text-secondary);" onclick="renderMyRegistration()">CANCEL</button></div></form>`;
    document.getElementById('editProfileForm').addEventListener('submit',e=>{e.preventDefault();AUTH.updateProfile({name:document.getElementById('epName').value.trim(),phone:document.getElementById('epPhone').value.trim(),country:document.getElementById('epCountry').value.trim(),gender:document.getElementById('epGender').value});notify('Profile updated!','success');renderMyRegistration();});
};
window.renderMyRegistration=renderMyRegistration;

window.downloadQRBadge=function(){
    const p=AUTH.profile;if(!p)return;
    const container=document.getElementById('qrBadgeContainer');container.style.display='block';container.innerHTML='';
    const canvas=document.createElement('canvas');container.appendChild(canvas);
    QRCode.toCanvas(canvas,JSON.stringify({id:p.id,name:p.name,category:p.category,email:p.email}),{width:260,margin:2},err=>{
        if(err){notify('QR generation failed','error');return;}
        const link=document.createElement('a');link.download=`panafest-badge-${p.id}.png`;link.href=canvas.toDataURL('image/png');link.click();
        notify('QR badge downloaded','success');
    });
};

/* ============================================================
   11. CUSTOMER: PROGRAMS
   ============================================================ */
window.renderPrograms=function(filter=''){
    const wrap=document.getElementById('programsList');if(!wrap)return;
    const list=DB.programs.filter(p=>!filter||(p.title||'').toLowerCase().includes(filter.toLowerCase()));
    if(!list.length){wrap.innerHTML='<p style="text-align:center; padding:40px;">No programs found.</p>';return;}
    wrap.innerHTML=list.map(p=>`<div class="program-card" onclick="showProgramDetail('${p.id}')" style="cursor:pointer;"><div class="program-card-image"><img src="${esc(p.image||placeholderImage(p.title?.slice(0,20)||'Program'))}" alt="${esc(p.title)}"></div><div class="program-card-body"><h4>${esc(p.title)}</h4><p class="muted">${esc(p.category||'')}</p><p class="small"><i class="fas fa-calendar"></i> ${p.date?new Date(p.date).toLocaleDateString():'TBA'}</p><p class="small"><i class="fas fa-map-marker-alt"></i> ${esc(p.venue||'TBA')}</p></div></div>`).join('');
};

window.showProgramDetail=function(id){
    const p=DB.find('programs',id);if(!p){notify('Program not found','error');return;}
    const image=p.image||placeholderImage(p.title?.slice(0,20)||'Program');
    const videos=p.videos||[];
    window.showDetailPage(`
        <div class="detail-hero"><img src="${esc(image)}" alt="${esc(p.title)}"></div>
        <div class="detail-body">
            <h1 class="detail-title">${esc(p.title)}</h1>
            <div class="detail-meta"><span><i class="fas fa-tag"></i> ${esc(p.category||'General')}</span><span><i class="fas fa-calendar"></i> ${p.date?new Date(p.date).toLocaleString():'TBA'}</span><span><i class="fas fa-map-marker-alt"></i> ${esc(p.venue||'TBA')}</span></div>
            <div class="detail-description"><h3>About this Program</h3><p>${esc(p.description||'No description available.')}</p></div>
            ${videos.length?`<div class="detail-videos"><h3>Previous Editions</h3><div class="video-grid">${videos.map(v=>`<div class="video-embed"><iframe src="${esc(v)}" frameborder="0" allowfullscreen></iframe></div>`).join('')}</div></div>`:''}
            <div class="detail-pricing"><div class="price-box"><span class="price-label">Individual</span><span class="price">GHS ${(p.individualPrice||0).toFixed(2)}</span></div><div class="price-box"><span class="price-label">Group</span><span class="price">GHS ${(p.groupPrice||0).toFixed(2)}</span></div></div>
            <div class="detail-actions"><button class="auth-btn" onclick="bookmarkProgram('${p.id}')"><i class="fas fa-bookmark"></i> BOOKMARK</button><button class="auth-btn" onclick="showProgramRegistrationPage('${p.id}','individual')" style="background:var(--success-glow); color:#0a0a0f;"><i class="fas fa-ticket-alt"></i> TICKET · Individual</button><button class="auth-btn" onclick="showProgramRegistrationPage('${p.id}','group')" style="background:var(--gold-primary);"><i class="fas fa-users"></i> REGISTER · Group</button></div>
        </div>`);
};

window.bookmarkProgram=function(id){const p=DB.find('programs',id);if(p)notify(`Program "${p.title}" bookmarked`,'success');};
document.getElementById('programSearchBtn')?.addEventListener('click',()=>window.renderPrograms(document.getElementById('programSearch').value));
document.getElementById('programSearch')?.addEventListener('keyup',e=>{if(e.key==='Enter')window.renderPrograms(e.target.value);});

window.showProgramRegistrationPage=function(programId,type){
    const p=DB.find('programs',programId);if(!p)return;
    const isGroup=type==='group';const unitPrice=isGroup?(p.groupPrice||0):(p.individualPrice||0);
    window.showDetailPage(`
        <div class="payment-page">
            <h1><i class="fas fa-ticket-alt"></i> Register: ${esc(p.title)}</h1>
            <p class="muted">${isGroup?'Group':'Individual'} Registration</p>
            <form id="programRegForm" class="admin-form" style="margin-top:20px;">
                <div class="form-row two-col"><div class="form-group"><label>Full Name</label><input type="text" id="prName" value="${esc(AUTH.profile?.name||'')}" required></div><div class="form-group"><label>Email</label><input type="email" id="prEmail" value="${esc(AUTH.profile?.email||'')}" required></div></div>
                <div class="form-row two-col"><div class="form-group"><label>Phone</label><input type="tel" id="prPhone" value="${esc(AUTH.profile?.phone||'')}" required></div><div class="form-group"><label>Quantity</label><input type="number" id="prQuantity" min="1" value="1" required onchange="updatePrTotal()"></div></div>
                <div class="form-group"><label>Payment Method</label><select id="prPayment"><option value="MTN">MTN Mobile Money</option><option value="Telecel">Telecel Cash</option><option value="AirtelTigo">AirtelTigo Money</option></select></div>
                <div class="form-group"><label>Mobile Money Number</label><input type="tel" id="prMobileMoney" placeholder="024XXXXXXX" required></div>
                <div class="payment-summary"><p><strong>Unit Price:</strong> GHS ${unitPrice.toFixed(2)}</p><p><strong>Total Due:</strong> <span class="price" id="prTotal">GHS ${unitPrice.toFixed(2)}</span></p></div>
                <button type="submit" class="auth-btn"><i class="fas fa-lock"></i> PAY & REGISTER</button>
            </form>
        </div>`);
    window.updatePrTotal=function(){const q=parseInt(document.getElementById('prQuantity').value,10)||1;document.getElementById('prTotal').textContent='GHS '+(unitPrice*q).toFixed(2);};
    document.getElementById('programRegForm').addEventListener('submit',async e=>{
        e.preventDefault();const btn=e.target.querySelector('button[type="submit"]');
        await withLoading(async()=>{
            const quantity=parseInt(document.getElementById('prQuantity').value,10)||1;
            const total=unitPrice*quantity;
            const reg={programId:p.id,programTitle:p.title,userId:AUTH.current.id,userName:document.getElementById('prName').value.trim(),userEmail:document.getElementById('prEmail').value.trim(),userPhone:document.getElementById('prPhone').value.trim(),type,quantity,paymentMethod:document.getElementById('prPayment').value,mobileMoney:document.getElementById('prMobileMoney').value.trim(),total,status:'confirmed',reference:'PRG-'+Math.random().toString(36).slice(2,10).toUpperCase(),createdAt:new Date().toISOString()};
            DB.add('programRegistrations',reg);
            DB.add('transactions',{id:'txn-'+Date.now(),userId:AUTH.current.id,userName:reg.userName,type:'program',item:p.title,amount:total,paymentMethod:reg.paymentMethod,mobileMoney:reg.mobileMoney,reference:reg.reference,status:'completed',createdAt:new Date().toISOString()});
            window.showDetailPage(`<div class="payment-success"><i class="fas fa-check-circle" style="font-size:5rem; color:var(--success-glow);"></i><h1>Registration Confirmed!</h1><p>Reference: <strong>${reg.reference}</strong></p><p>Amount Paid: <strong class="price">GHS ${total.toFixed(2)}</strong></p><button class="auth-btn" onclick="closeDetailPage()"><i class="fas fa-arrow-left"></i> BACK</button></div>`);
        },btn,null,'Registration failed');
    });
};

/* ============================================================
   12. CUSTOMER: EVENT SCHEDULE
   ============================================================ */
function renderEventSchedule(){
    const wrap=document.getElementById('scheduleTimeline');if(!wrap)return;
    if(!DB.events.length){wrap.innerHTML='<p style="text-align:center; padding:40px;">No events scheduled.</p>';return;}
    const groups={};
    DB.events.forEach(ev=>{const k=new Date(ev.date).toISOString().slice(0,10);if(!groups[k])groups[k]=[];groups[k].push(ev);});
    const days=Object.keys(groups).sort();
    const today=new Date();const todayKey=today.toISOString().slice(0,10);
    wrap.innerHTML=days.map(dayKey=>{
        const events=groups[dayKey].sort((a,b)=>new Date(a.date)-new Date(b.date));
        const dateObj=new Date(dayKey);
        const diffDays=Math.round((dateObj-new Date(todayKey))/86400000);
        const isToday=dayKey===todayKey;const isPast=diffDays<0;const isUpcoming=diffDays>0&&diffDays<=7;
        const dayClass=isToday?'schedule-day-today':isPast?'schedule-day-past':isUpcoming?'schedule-day-upcoming':'';
        const badge=isToday?'● TODAY':isPast?'PAST':isUpcoming?`● IN ${diffDays} DAY${diffDays>1?'S':''}`:'SCHEDULED';
        return `<div class="schedule-day ${dayClass}"><div class="schedule-day-header"><div class="schedule-day-date"><span class="day-num">${dateObj.getDate()}</span><span class="day-month">${dateObj.toLocaleString('default',{month:'short'}).toUpperCase()}</span></div><div class="schedule-day-title"><h4>${dateObj.toLocaleDateString(undefined,{weekday:'long'})}</h4><span class="day-badge">${badge}</span></div></div><div class="schedule-day-events">${events.map(ev=>{const evTime=new Date(ev.date);const timeStr=evTime.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});const isLive=isToday&&Math.abs(today-evTime)<3600000*2;return `<div class="schedule-event-item ${isLive?'event-live':''}"><div class="event-time">${timeStr}</div><div class="event-info"><h5>${esc(ev.title)}</h5><p class="small"><i class="fas fa-map-marker-alt"></i> ${esc(ev.venue||'')}</p>${ev.description?`<p class="small">${esc(ev.description)}</p>`:''}</div>${isLive?'<span class="live-badge">LIVE</span>':''}</div>`;}).join('')}</div></div>`;
    }).join('');
}

/* ============================================================
   13. CUSTOMER: TICKETING
   ============================================================ */
const TICKET_TYPES=[
    {type:'General Admission',price:100},{type:'VIP Pass',price:500},{type:'Day Pass',price:60},
    {type:'Group Pass',price:400},{type:'Student Pass',price:40},{type:'Tour Package',price:1200}
];

function renderTicketing(){
    document.getElementById('ticketTypesGrid').innerHTML=TICKET_TYPES.map(t=>`<div class="ticket-type-card"><h4>${t.type}</h4><p class="price">GHS ${t.price}</p><button class="auth-btn small-btn" onclick="showTicketPurchasePage('${t.type}',${t.price})"><i class="fas fa-shopping-cart"></i> BUY</button></div>`).join('');
    renderMyTickets();
}

window.showTicketPurchasePage=function(type,price){
    window.showDetailPage(`
        <div class="payment-page">
            <h1><i class="fas fa-ticket-alt"></i> Purchase Ticket</h1>
            <div class="payment-summary" style="margin:20px 0;"><p><strong>Ticket Type:</strong> ${esc(type)}</p><p><strong>Price:</strong> <span class="price">GHS ${price.toFixed(2)}</span></p></div>
            <form id="ticketPurchaseForm" class="admin-form">
                <h3 style="margin-bottom:12px;"><i class="fas fa-mobile-alt"></i> Payment Method</h3>
                <div class="mobile-money-options">
                    <label class="mm-option"><input type="radio" name="mmNetwork" value="MTN" checked><span class="mm-card mm-mtn"><i class="fas fa-sim-card"></i> MTN Mobile Money</span></label>
                    <label class="mm-option"><input type="radio" name="mmNetwork" value="Telecel"><span class="mm-card mm-telecel"><i class="fas fa-sim-card"></i> Telecel Cash</span></label>
                    <label class="mm-option"><input type="radio" name="mmNetwork" value="AirtelTigo"><span class="mm-card mm-airteltigo"><i class="fas fa-sim-card"></i> AirtelTigo Money</span></label>
                </div>
                <div class="form-group"><label>Mobile Money Number</label><input type="tel" id="tpMobile" placeholder="024XXXXXXX" required></div>
                <div class="form-group"><label>Account Name</label><input type="text" id="tpName" value="${esc(AUTH.profile?.name||'')}" required></div>
                <div class="payment-note"><i class="fas fa-info-circle"></i><p>You will receive a prompt on your phone to approve <strong>GHS ${price.toFixed(2)}</strong>. Enter your PIN to complete.</p></div>
                <button type="submit" class="auth-btn"><i class="fas fa-lock"></i> PAY GHS ${price.toFixed(2)}</button>
            </form>
        </div>`);
    document.getElementById('ticketPurchaseForm').addEventListener('submit',async e=>{
        e.preventDefault();const btn=e.target.querySelector('button[type="submit"]');
        await withLoading(async()=>{
            const network=document.querySelector('input[name="mmNetwork"]:checked').value;
            const code='PNF-'+Math.random().toString(36).slice(2,10).toUpperCase();
            const ticket={userId:AUTH.current.id,userName:AUTH.profile.name,type,price,status:'valid',issuedAt:new Date().toISOString(),code,paymentMethod:network,mobileMoney:document.getElementById('tpMobile').value.trim(),accountName:document.getElementById('tpName').value.trim(),transactionRef:'TXN-'+Date.now()};
            DB.add('tickets',ticket);
            DB.add('transactions',{id:'txn-'+Date.now(),userId:AUTH.current.id,userName:AUTH.profile.name,type:'ticket',item:`${type} Ticket`,amount:price,paymentMethod:network,mobileMoney:ticket.mobileMoney,reference:code,status:'completed',createdAt:new Date().toISOString()});
            window.showDetailPage(`<div class="payment-success"><i class="fas fa-check-circle" style="font-size:5rem; color:var(--success-glow);"></i><h1>Payment Successful!</h1><p>Ticket Code: <strong>${code}</strong></p><p>Paid via <strong>${network}</strong></p><div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:20px;"><button class="auth-btn" onclick="closeDetailPage(); navigateToModule('ticketingModule');"><i class="fas fa-list"></i> VIEW MY TICKETS</button></div></div>`);
        },btn,null,'Payment failed');
    });
};

function renderMyTickets(){
    const wrap=document.getElementById('myTicketsList');if(!wrap||!AUTH.current)return;
    const my=DB.tickets.filter(t=>t.userId===AUTH.current.id);
    if(!my.length){wrap.innerHTML='<p class="muted" style="text-align:center; padding:20px;">No tickets yet. Buy one above!</p>';return;}
    wrap.innerHTML=my.map(t=>`<div class="ticket-row"><div><strong>${esc(t.type)}</strong><p class="small">Code: ${esc(t.code)} · GHS ${t.price}</p><p class="small">Paid via ${esc(t.paymentMethod||'N/A')} · ${new Date(t.issuedAt).toLocaleDateString()}</p></div><div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;"><span class="status-badge ${t.status==='valid'?'status-success':'status-danger'}">${t.status.toUpperCase()}</span><button class="auth-btn small-btn" onclick="showTicketQR('${t.id}')"><i class="fas fa-qrcode"></i> QR</button></div></div>`).join('');
}

window.showTicketQR=function(ticketId){
    const t=DB.find('tickets',ticketId);if(!t)return;
    const canvas=document.createElement('canvas');
    QRCode.toCanvas(canvas,JSON.stringify({id:t.id,code:t.code}),{width:240},err=>{
        if(err){notify('QR generation failed','error');return;}
        const modal=document.getElementById('mediaLightbox');
        document.getElementById('mediaLightboxVideo').style.display='none';
        const img=document.getElementById('mediaLightboxImg');
        img.style.display='block';img.src=canvas.toDataURL('image/png');modal.style.display='flex';
    });
};

/* ============================================================
   14. CUSTOMER: ACCOMMODATION
   ============================================================ */
function renderAccommodation(){
    const wrap=document.getElementById('accommodationsList');
    wrap.innerHTML=DB.accommodations.length?DB.accommodations.map(a=>`<div class="accom-card" onclick="showAccommodationDetail('${a.id}')" style="cursor:pointer;"><div class="accom-card-image"><img src="${esc(a.image||placeholderImage(a.name?.slice(0,20)||'Hotel'))}" alt="${esc(a.name)}"></div><div class="accom-card-body"><h4>${esc(a.name)}</h4><p class="muted">${esc(a.type)} · ${esc(a.location)}</p><p class="small"><i class="fas fa-bed"></i> ${a.rooms} rooms · GHS ${a.price}/night</p></div></div>`).join(''):'<p style="text-align:center; padding:40px;">No accommodations available.</p>';
    renderMyBookings();
}

window.showAccommodationDetail=function(id){
    const a=DB.find('accommodations',id);if(!a)return;
    const image=a.image||placeholderImage(a.name?.slice(0,20)||'Hotel');
    const gallery=a.gallery&&a.gallery.length?a.gallery:[image];
    const videos=a.videos||[];
    window.showDetailPage(`
        <div class="detail-hero"><img src="${esc(image)}" alt="${esc(a.name)}"></div>
        <div class="detail-body">
            <h1 class="detail-title">${esc(a.name)}</h1>
            <div class="detail-meta"><span><i class="fas fa-tag"></i> ${esc(a.type)}</span><span><i class="fas fa-map-marker-alt"></i> ${esc(a.location)}</span><span><i class="fas fa-bed"></i> ${a.rooms} rooms</span><span><i class="fas fa-phone"></i> ${esc(a.contact)}</span></div>
            <div class="detail-description"><h3>About this Property</h3><p>${esc(a.description||'Comfortable accommodation in '+a.location+'.')}</p></div>
            <div class="gallery-grid-detail">${gallery.map(g=>`<img src="${esc(g)}" alt="Gallery">`).join('')}</div>
            ${videos.length?`<div class="detail-videos"><h3>Room Tour Videos</h3><div class="video-grid">${videos.map(v=>`<div class="video-embed"><iframe src="${esc(v)}" frameborder="0" allowfullscreen></iframe></div>`).join('')}</div></div>`:''}
            <div class="detail-pricing"><div class="price-box"><span class="price-label">Per Night</span><span class="price">GHS ${a.price.toFixed(2)}</span></div></div>
            <div class="detail-actions"><button class="auth-btn" onclick="showAccommodationBookingPage('${a.id}','individual')"><i class="fas fa-user"></i> BOOK · Individual</button><button class="auth-btn" onclick="showAccommodationBookingPage('${a.id}','group')" style="background:var(--gold-primary);"><i class="fas fa-users"></i> BOOK · Group</button></div>
        </div>`);
};

window.showAccommodationBookingPage=function(id,type){
    const a=DB.find('accommodations',id);if(!a)return;
    const isGroup=type==='group';
    window.showDetailPage(`
        <div class="payment-page">
            <h1><i class="fas fa-bed"></i> Book: ${esc(a.name)}</h1>
            <p class="muted">${isGroup?'Group':'Individual'} Booking</p>
            <form id="accomBookingForm" class="admin-form" style="margin-top:20px;">
                <div class="form-row two-col"><div class="form-group"><label>Full Name</label><input type="text" id="abName" value="${esc(AUTH.profile?.name||'')}" required></div><div class="form-group"><label>Email</label><input type="email" id="abEmail" value="${esc(AUTH.profile?.email||'')}" required></div></div>
                <div class="form-row two-col"><div class="form-group"><label>Check-in</label><input type="date" id="abCheckin" required></div><div class="form-group"><label>Check-out</label><input type="date" id="abCheckout" required></div></div>
                <div class="form-row two-col"><div class="form-group"><label>Rooms</label><input type="number" id="abRooms" min="1" value="${isGroup?3:1}" onchange="updateAbTotal()" required></div><div class="form-group"><label>Guests</label><input type="number" id="abGuests" min="1" value="${isGroup?5:1}" required></div></div>
                <div class="form-group"><label>Payment Method</label><select id="abPayment"><option value="MTN">MTN Mobile Money</option><option value="Telecel">Telecel Cash</option><option value="AirtelTigo">AirtelTigo Money</option></select></div>
                <div class="form-group"><label>Mobile Money Number</label><input type="tel" id="abMobileMoney" placeholder="024XXXXXXX" required></div>
                <div class="payment-summary"><p><strong>Price Per Night:</strong> GHS ${a.price.toFixed(2)}</p><p><strong>Estimated Total:</strong> <span class="price" id="abTotal">GHS ${a.price.toFixed(2)}</span></p></div>
                <button type="submit" class="auth-btn"><i class="fas fa-lock"></i> PAY & BOOK</button>
            </form>
        </div>`);
    window.updateAbTotal=function(){const rooms=parseInt(document.getElementById('abRooms').value,10)||1;const ci=document.getElementById('abCheckin').value,co=document.getElementById('abCheckout').value;const nights=ci&&co?Math.max(1,Math.round((new Date(co)-new Date(ci))/86400000)):1;document.getElementById('abTotal').textContent='GHS '+(a.price*rooms*nights).toFixed(2);};
    document.getElementById('abCheckin').addEventListener('change',window.updateAbTotal);
    document.getElementById('abCheckout').addEventListener('change',window.updateAbTotal);
    document.getElementById('accomBookingForm').addEventListener('submit',async e=>{
        e.preventDefault();const btn=e.target.querySelector('button[type="submit"]');
        await withLoading(async()=>{
            const rooms=parseInt(document.getElementById('abRooms').value,10)||1;
            const ci=document.getElementById('abCheckin').value,co=document.getElementById('abCheckout').value;
            const nights=Math.max(1,Math.round((new Date(co)-new Date(ci))/86400000));
            const total=a.price*rooms*nights;
            const booking={userId:AUTH.current.id,userName:document.getElementById('abName').value.trim(),userEmail:document.getElementById('abEmail').value.trim(),accommodationId:a.id,accommodationName:a.name,type,rooms,guests:parseInt(document.getElementById('abGuests').value,10)||1,checkin:ci,checkout:co,nights,total,paymentMethod:document.getElementById('abPayment').value,mobileMoney:document.getElementById('abMobileMoney').value.trim(),status:'pending',reference:'BK-'+Math.random().toString(36).slice(2,10).toUpperCase(),createdAt:new Date().toISOString()};
            DB.add('bookings',booking);
            DB.add('transactions',{id:'txn-'+Date.now(),userId:AUTH.current.id,userName:booking.userName,type:'accommodation',item:a.name,amount:total,paymentMethod:booking.paymentMethod,mobileMoney:booking.mobileMoney,reference:booking.reference,status:'completed',createdAt:new Date().toISOString()});
            window.showDetailPage(`<div class="payment-success"><i class="fas fa-check-circle" style="font-size:5rem; color:var(--success-glow);"></i><h1>Booking Confirmed!</h1><p>Reference: <strong>${booking.reference}</strong></p><p>${rooms} room(s) · ${nights} night(s)</p><p>Total: <strong class="price">GHS ${total.toFixed(2)}</strong></p><button class="auth-btn" onclick="closeDetailPage(); navigateToModule('accommodationModule');"><i class="fas fa-list"></i> VIEW MY BOOKINGS</button></div>`);
        },btn,null,'Booking failed');
    });
};

function renderMyBookings(){
    const wrap=document.getElementById('myBookingsList');if(!wrap||!AUTH.current)return;
    const mine=DB.bookings.filter(b=>b.userId===AUTH.current.id);
    wrap.innerHTML=mine.length?mine.map(b=>`<div class="ticket-row"><div><strong>${esc(b.accommodationName)}</strong><p class="small">${b.nights} night(s) · ${b.rooms||1} room(s) · ${b.type||'individual'}</p><p class="small">Ref: ${esc(b.reference||b.id)}</p></div><span class="status-badge ${b.status==='pending'?'status-warning':'status-success'}">${b.status.toUpperCase()}</span></div>`).join(''):'<p class="muted" style="text-align:center; padding:20px;">No bookings yet.</p>';
}

/* ============================================================
   15. CUSTOMER: MARKETPLACE
   ============================================================ */
function initMarketplace(){
    document.querySelectorAll('.mp-tab').forEach(btn=>{btn.onclick=()=>switchMpTab(btn.dataset.mpTab);});
    switchMpTab('browse');renderMpVendors();renderMpMyListings();setupMpForm();
}

function switchMpTab(tab){
    document.querySelectorAll('.mp-tab').forEach(b=>b.classList.toggle('active-mp-tab',b.dataset.mpTab===tab));
    document.querySelectorAll('.mp-tab-content').forEach(c=>c.classList.remove('active-mp-content'));
    const map={browse:'mpBrowseTab',post:'mpPostTab',mylistings:'mpMyListingsTab',vendors:'mpVendorsTab'};
    if(map[tab])document.getElementById(map[tab]).classList.add('active-mp-content');
    if(tab==='browse')renderMpProducts();
    if(tab==='mylistings')renderMpMyListings();
    if(tab==='vendors')renderMpVendors();
}

function renderMpProducts(){
    const wrap=document.getElementById('mpProductsGrid');const emptyEl=document.getElementById('mpEmptyState');if(!wrap)return;
    const searchTerm=(document.getElementById('mpSearch')?.value||'').toLowerCase().trim();
    const category=document.getElementById('mpCategoryFilter')?.value||'all';
    const sort=document.getElementById('mpSortFilter')?.value||'newest';
    let list=DB.products.filter(p=>p.status==='approved');
    if(searchTerm)list=list.filter(p=>(p.title||'').toLowerCase().includes(searchTerm)||(p.description||'').toLowerCase().includes(searchTerm)||(p.category||'').toLowerCase().includes(searchTerm)||(p.sellerName||'').toLowerCase().includes(searchTerm));
    if(category!=='all')list=list.filter(p=>p.category===category);
    if(sort==='price_low')list.sort((a,b)=>(a.price||0)-(b.price||0));
    else if(sort==='price_high')list.sort((a,b)=>(b.price||0)-(a.price||0));
    else list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if(!list.length){wrap.innerHTML='';if(emptyEl)emptyEl.style.display='block';return;}
    if(emptyEl)emptyEl.style.display='none';
    wrap.innerHTML=list.map(p=>renderMpProductCard(p,false)).join('');
}

function renderMpProductCard(p,isMine){
    const imageHtml=p.image?`<img src="${esc(p.image)}" alt="${esc(p.title)}" style="width:100%; height:100%; object-fit:cover;">`:`<i class="fas fa-image" style="font-size:2.5rem; color:var(--text-secondary);"></i>`;
    const statusBadge=isMine?`<span class="status-badge ${p.status==='approved'?'status-success':p.status==='rejected'?'status-danger':'status-warning'}">${(p.status||'pending').toUpperCase()}</span>`:'';
    const actionBtn=isMine?`<button class="action-btn delete-btn" onclick="event.stopPropagation(); deleteMpProduct('${p.id}')"><i class="fas fa-trash"></i> Delete</button>`:'';
    const onclick=isMine?'':`onclick="showProductDetail('${p.id}')"`;
    return `<div class="mp-product-card" ${onclick} style="${isMine?'':'cursor:pointer;'}"><div class="mp-product-image">${imageHtml}</div><div class="mp-product-info"><h4>${esc(p.title)}</h4><p class="muted" style="font-size:0.72rem; margin-bottom:4px;"><i class="fas fa-tag"></i> ${esc(p.category||'Other')}</p><p class="mp-price">GHS ${(p.price||0).toFixed(2)}</p>${statusBadge}${actionBtn}</div></div>`;
}

window.showProductDetail=function(id){
    const p=DB.find('products',id);if(!p)return;
    const image=p.image||placeholderImage(p.title?.slice(0,20)||'Product');
    const phone=String(p.contact||'').replace(/\D/g,'');
    const whatsappUrl=phone.length>=10?`https://wa.me/${phone}?text=${encodeURIComponent(`Hello, I'm interested in "${p.title}" listed on PANAFEST Marketplace.`)}`:null;
    window.showDetailPage(`
        <div class="detail-hero"><img src="${esc(image)}" alt="${esc(p.title)}"></div>
        <div class="detail-body">
            <h1 class="detail-title">${esc(p.title)}</h1>
            <div class="detail-meta"><span><i class="fas fa-tag"></i> ${esc(p.category)}</span><span><i class="fas fa-user"></i> ${esc(p.sellerName||'Anonymous')}</span></div>
            <p class="price" style="font-size:1.8rem; margin:20px 0;">GHS ${(p.price||0).toFixed(2)}</p>
            <div class="detail-description"><h3>Description</h3><p>${esc(p.description)}</p></div>
            <div class="detail-actions">${whatsappUrl?`<a href="${whatsappUrl}" target="_blank" class="auth-btn" style="background:linear-gradient(145deg, #25D366, #128C7E); text-decoration:none; display:inline-flex;"><i class="fab fa-whatsapp"></i> CONTACT SELLER ON WHATSAPP</a>`:'<p class="muted">Seller contact not available.</p>'}</div>
        </div>`);
};

function renderMpMyListings(){
    const wrap=document.getElementById('mpMyListingsGrid');const emptyEl=document.getElementById('mpMyEmptyState');if(!wrap||!AUTH.current)return;
    const mine=DB.products.filter(p=>p.sellerId===AUTH.current.id);
    if(!mine.length){wrap.innerHTML='';if(emptyEl)emptyEl.style.display='block';return;}
    if(emptyEl)emptyEl.style.display='none';
    wrap.innerHTML=mine.map(p=>renderMpProductCard(p,true)).join('');
}

function renderMpVendors(){
    const wrap=document.getElementById('mpVendorsGrid');if(!wrap)return;
    wrap.innerHTML=DB.vendors.length?DB.vendors.map(v=>`<div class="vendor-card" onclick="showVendorDetail('${v.id}')" style="cursor:pointer;"><div class="vendor-card-image"><img src="${esc(v.image||placeholderImage(v.name?.slice(0,20)||'Vendor','#b96bff','#8844cc'))}" alt="${esc(v.name)}"></div><div class="vendor-card-body"><h4>${esc(v.name)}</h4><p class="muted">${esc(v.category)}</p><p class="small"><i class="fas fa-user"></i> ${esc(v.owner||'')}</p></div></div>`).join(''):'<p style="text-align:center; padding:40px;">No vendors yet.</p>';
}

window.showVendorDetail=function(vendorId){
    const v=DB.find('vendors',vendorId);if(!v)return;
    const image=v.image||placeholderImage(v.name?.slice(0,20)||'Vendor','#b96bff','#8844cc');
    const products=DB.products.filter(p=>(p.vendorId===v.id||p.sellerId===v.id)&&p.status==='approved');
    window.showDetailPage(`
        <div class="detail-hero small"><img src="${esc(image)}" alt="${esc(v.name)}"></div>
        <div class="detail-body">
            <h1 class="detail-title">${esc(v.name)}</h1>
            <div class="detail-meta"><span><i class="fas fa-tag"></i> ${esc(v.category)}</span><span><i class="fas fa-user"></i> ${esc(v.owner||'')}</span><span><i class="fas fa-phone"></i> ${esc(v.contact)}</span></div>
            ${v.description?`<div class="detail-description"><h3>About this Shop</h3><p>${esc(v.description)}</p></div>`:''}
            <h3 style="margin:20px 0 12px; color:var(--gold-primary);">Products (${products.length})</h3>
            <div class="mp-products-grid">${products.length?products.map(p=>renderMpProductCard(p,false)).join(''):'<p class="muted">No products from this vendor yet.</p>'}</div>
        </div>`);
};

window.deleteMpProduct=async function(id){if(!(await confirmAction('Delete this listing?')))return;DB.remove('products',id);notify('Listing deleted','success');renderMpMyListings();renderMpProducts();};

let pendingMpImageData=null;
function setupMpForm(){
    const form=document.getElementById('mpPostForm');if(!form||form.dataset.bound==='true')return;
    form.dataset.bound='true';
    document.getElementById('mpImage')?.addEventListener('change',async e=>{
        const file=e.target.files[0];if(!file){pendingMpImageData=null;document.getElementById('mpImagePreview').style.display='none';return;}
        try{pendingMpImageData=await fileToCompressedDataUrl(file,500,0.7);document.getElementById('mpImagePreviewImg').src=pendingMpImageData;document.getElementById('mpImagePreview').style.display='block';}catch{notify('Image processing failed','error');}
    });
    form.addEventListener('submit',async e=>{
        e.preventDefault();const btn=form.querySelector('button[type="submit"]');
        await withLoading(async()=>{
            if(!AUTH.current)throw new Error('Please log in first.');
            const product={title:document.getElementById('mpTitle').value.trim(),description:document.getElementById('mpDescription').value.trim(),category:document.getElementById('mpCategory').value,price:parseFloat(document.getElementById('mpPrice').value),contact:document.getElementById('mpContact').value.trim(),image:pendingMpImageData,sellerId:AUTH.current.id,sellerName:AUTH.profile.name,status:'pending',createdAt:new Date().toISOString()};
            if(!product.title||!product.description||isNaN(product.price)||!product.contact)throw new Error('Please fill all fields');
            DB.add('products',product);
            form.reset();pendingMpImageData=null;document.getElementById('mpImagePreview').style.display='none';
            notify('Listing posted! Awaiting admin approval.','success');
            renderMpMyListings();
        },btn,null,'Failed to post listing');
    });
}
document.getElementById('mpSearchBtn')?.addEventListener('click',renderMpProducts);
document.getElementById('mpSearch')?.addEventListener('keyup',e=>{if(e.key==='Enter')renderMpProducts();});
document.getElementById('mpCategoryFilter')?.addEventListener('change',renderMpProducts);
document.getElementById('mpSortFilter')?.addEventListener('change',renderMpProducts);

/* ============================================================
   16. CUSTOMER: MEDIA
   ============================================================ */
function renderMediaCenter(tab='photos'){
    document.querySelectorAll('.media-tab').forEach(b=>{b.classList.toggle('active-media-tab',b.dataset.mediaTab===tab);b.onclick=()=>renderMediaCenter(b.dataset.mediaTab);});
    const wrap=document.getElementById('mediaTabContent');if(!wrap)return;
    if(tab==='photos'){
        const photos=DB.media.filter(m=>m.type==='photo');
        wrap.innerHTML=`<div class="card-grid-3">${photos.map(p=>`<div class="media-card" onclick="showMediaLightbox('image','${esc(p.url)}')"><img src="${esc(p.url)}" alt="${esc(p.title)}"><p>${esc(p.title)}</p></div>`).join('')||'<p class="muted">No photos yet.</p>'}</div>`;
    }else if(tab==='videos'){
        const videos=DB.media.filter(m=>m.type==='video');
        wrap.innerHTML=`<div class="card-grid-3">${videos.map(v=>`<div class="media-card" onclick="showMediaLightbox('video','${esc(v.url)}')"><div class="media-video-thumb"><i class="fas fa-play-circle"></i></div><p>${esc(v.title)}</p></div>`).join('')||'<p class="muted">No videos yet.</p>'}</div>`;
    }else if(tab==='press'){
        const press=DB.media.filter(m=>m.type==='press');
        wrap.innerHTML=press.length?press.map(p=>`<div class="ticket-row"><div><strong>${esc(p.title)}</strong><p class="small">${esc(p.description||'')}</p></div><a class="auth-btn small-btn" href="${esc(p.url)}" target="_blank"><i class="fas fa-file-pdf"></i> OPEN</a></div>`).join(''):'<p class="muted">No press releases yet.</p>';
    }else{
        wrap.innerHTML=`<div class="glass-panel" style="padding:20px; text-align:center;"><i class="fas fa-satellite-dish" style="font-size:3rem; color:var(--gold-primary);"></i><h3 style="margin-top:12px;">Live Stream</h3><p class="muted">Live streaming activates during PANAFEST events.</p></div>`;
    }
}
window.showMediaLightbox=function(type,url){
    const modal=document.getElementById('mediaLightbox');const img=document.getElementById('mediaLightboxImg');const vid=document.getElementById('mediaLightboxVideo');
    if(type==='image'){img.src=url;img.style.display='block';vid.style.display='none';}else{vid.src=url;vid.style.display='block';img.style.display='none';}
    modal.style.display='flex';
};
document.getElementById('closeMediaLightboxBtn')?.addEventListener('click',()=>{document.getElementById('mediaLightbox').style.display='none';document.getElementById('mediaLightboxVideo')?.pause();});

/* ============================================================
   17. CUSTOMER: HERITAGE
   ============================================================ */
const HERITAGE_CATS=['PANAFEST History','African History','Documentaries','Museum','Masterclasses'];

function renderHeritage(){
    document.getElementById('heritageCategories').innerHTML=HERITAGE_CATS.map(c=>`<div class="menu-card" onclick="filterHeritage('${c.replace(/'/g,"\\'")}')"><i class="fas fa-book"></i><h3>${c}</h3><p>Explore</p></div>`).join('');
    filterHeritage(HERITAGE_CATS[0]);
}
window.filterHeritage=function(cat){
    const items=DB.heritage.filter(h=>h.category===cat);
    document.getElementById('heritageResources').innerHTML=items.length?items.map(i=>`<div class="ticket-row"><div><strong>${esc(i.title)}</strong><p class="small">${esc(i.description||'')}</p></div>${i.url?`<a class="auth-btn small-btn" href="${esc(i.url)}" target="_blank">OPEN</a>`:''}</div>`).join(''):'<p class="muted" style="padding:20px;">No resources in this category yet.</p>';
};

/* ============================================================
   18. CUSTOMER: DIASPORA (enhanced)
   ============================================================ */
function initDiaspora(){
    document.querySelectorAll('.diaspora-tab').forEach(btn=>{btn.onclick=()=>switchDiasporaTab(btn.dataset.diasporaTab);});
    switchDiasporaTab('groups');
}

function switchDiasporaTab(tab){
    document.querySelectorAll('.diaspora-tab').forEach(b=>b.classList.toggle('active-diaspora-tab',b.dataset.diasporaTab===tab));
    const wrap=document.getElementById('diasporaTabContent');if(!wrap)return;
    if(tab==='groups')renderDiasporaGroups(wrap);
    else if(tab==='discussions')renderDiasporaDiscussions(wrap);
    else if(tab==='members')renderDiasporaMembers(wrap);
    else if(tab==='messages')renderDiasporaMessages(wrap);
}

function renderDiasporaGroups(wrap){
    wrap.innerHTML=`
        <p class="muted" style="margin-bottom:14px;">Join a chapter to connect with PANAFEST supporters from your region.</p>
        <div class="card-grid-3">${DB.diasporaGroups.map(g=>{
            const postCount=DB.diasporaPosts.filter(p=>p.groupName===g.name).length;
            return `<div class="menu-card" onclick="showDiasporaGroup('${g.id}')" style="cursor:pointer;"><i class="fas fa-users"></i><h3>${esc(g.name)}</h3><p>${esc(g.description||'')}</p><p class="small" style="color:var(--gold-primary); margin-top:6px;"><i class="fas fa-comments"></i> ${postCount} discussion${postCount!==1?'s':''}</p></div>`;
        }).join('')}</div>`;
}

window.showDiasporaGroup=function(groupId){
    const g=DB.find('diasporaGroups',groupId);if(!g)return;
    const posts=DB.diasporaPosts.filter(p=>p.groupName===g.name).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    window.showDetailPage(`
        <div class="detail-body">
            <h1 class="detail-title">${esc(g.name)}</h1>
            <div class="detail-meta"><span><i class="fas fa-globe"></i> Country Chapter</span><span><i class="fas fa-comments"></i> ${posts.length} discussion${posts.length!==1?'s':''}</span></div>
            <div class="detail-description"><h3>About this Chapter</h3><p>${esc(g.description||'')}</p></div>
            <h3 style="margin:20px 0 12px; color:var(--gold-primary);">Chapter Discussions</h3>
            <form id="groupPostForm" class="admin-form" style="margin-bottom:16px;">
                <textarea id="groupPostContent" placeholder="Share something with ${esc(g.name)}..." rows="3" required></textarea>
                <button type="submit" class="auth-btn" style="margin-top:8px;"><i class="fas fa-paper-plane"></i> POST TO ${esc(g.name).toUpperCase()}</button>
            </form>
            <div>${posts.length?posts.map(p=>`<div class="ticket-row" style="margin-bottom:8px;"><div><strong>${esc(p.authorName||'Anonymous')}</strong><p class="small">${esc(p.content||'')}</p><p class="small muted">${new Date(p.createdAt||Date.now()).toLocaleString()}</p></div></div>`).join(''):'<p class="muted">No discussions yet. Be the first!</p>'}</div>
        </div>`);
    document.getElementById('groupPostForm').addEventListener('submit',e=>{
        e.preventDefault();
        const content=document.getElementById('groupPostContent').value.trim();
        if(!content)return;
        DB.add('diasporaPosts',{groupName:g.name,authorName:AUTH.profile?.name||'Anonymous',authorId:AUTH.current?.id,content,createdAt:new Date().toISOString()});
        notify('Posted to '+g.name,'success');
        window.showDiasporaGroup(groupId);
    });
};

function renderDiasporaDiscussions(wrap){
    const posts=[...DB.diasporaPosts].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    wrap.innerHTML=`
        <form id="diasporaPostForm" class="admin-form" style="margin-bottom:20px;">
            <div class="form-group"><label>Select Chapter</label><select id="newPostGroup">${DB.diasporaGroups.map(g=>`<option value="${esc(g.name)}">${esc(g.name)}</option>`).join('')}</select></div>
            <div class="form-group"><label>Your Message</label><textarea id="diasporaPostContent" placeholder="Share something with the diaspora community..." rows="3" required></textarea></div>
            <button type="submit" class="auth-btn"><i class="fas fa-paper-plane"></i> POST DISCUSSION</button>
        </form>
        <h3 style="margin:20px 0 12px; color:var(--gold-primary);">All Discussions</h3>
        <div>${posts.length?posts.map(p=>`<div class="ticket-row" style="margin-bottom:8px;"><div><strong>${esc(p.authorName||'Anonymous')}</strong> <span class="small muted">· ${esc(p.groupName||'General')}</span><p class="small">${esc(p.content||'')}</p><p class="small muted">${new Date(p.createdAt||Date.now()).toLocaleString()}</p></div></div>`).join(''):'<p class="muted">No discussions yet.</p>'}</div>`;
    document.getElementById('diasporaPostForm').addEventListener('submit',e=>{
        e.preventDefault();
        const content=document.getElementById('diasporaPostContent').value.trim();
        const groupName=document.getElementById('newPostGroup').value;
        if(!content)return;
        DB.add('diasporaPosts',{groupName,authorName:AUTH.profile?.name||'Anonymous',authorId:AUTH.current?.id,content,createdAt:new Date().toISOString()});
        notify('Discussion posted!','success');
        renderDiasporaDiscussions(wrap);
    });
}

function renderDiasporaMembers(wrap){
    const members=DB.users.filter(u=>u.role!=='admin');
    wrap.innerHTML=`
        <p class="muted" style="margin-bottom:14px;">Connect with other PANAFEST attendees. Follow members to stay in touch.</p>
        <div class="card-grid-3">${members.length?members.map(m=>{
            const isFollowing=DB.diasporaFollows.some(f=>f.followerId===AUTH.current?.id&&f.followingId===m.id);
            return `<div class="menu-card"><i class="fas fa-user-circle"></i><h3>${esc(m.name||'Anonymous')}</h3><p>${esc(m.country||'')} · ${esc(m.category||'')}</p><button class="auth-btn small-btn" onclick="toggleFollow('${m.id}')" style="margin-top:8px; background:${isFollowing?'var(--success-glow)':'transparent'}; color:${isFollowing?'#0a0a0f':'var(--gold-primary)'}; border:1px solid var(--gold-primary);"><i class="fas fa-${isFollowing?'check':'user-plus'}"></i> ${isFollowing?'Following':'Follow'}</button></div>`;
        }).join(''):'<p class="muted">No members yet.</p>'}</div>`;
}

window.toggleFollow=function(userId){
    const existing=DB.diasporaFollows.find(f=>f.followerId===AUTH.current.id&&f.followingId===userId);
    if(existing){DB.remove('diasporaFollows',existing.id);notify('Unfollowed','info');}
    else{DB.add('diasporaFollows',{followerId:AUTH.current.id,followingId:userId,followedAt:new Date().toISOString()});notify('Now following','success');}
    switchDiasporaTab('members');
};

function renderDiasporaMessages(wrap){
    const sent=DB.diasporaMessages.filter(m=>m.fromUserId===AUTH.current?.id).sort((a,b)=>new Date(b.sentAt)-new Date(a.sentAt));
    const received=DB.diasporaMessages.filter(m=>m.toUserId===AUTH.current?.id).sort((a,b)=>new Date(b.sentAt)-new Date(a.sentAt));
    const members=DB.users.filter(u=>u.role!=='admin'&&u.id!==AUTH.current?.id);
    wrap.innerHTML=`
        <form id="sendMessageForm" class="admin-form" style="margin-bottom:20px;">
            <div class="form-group"><label>Send To</label><select id="msgRecipient">${members.map(m=>`<option value="${m.id}">${esc(m.name||'Anonymous')} (${esc(m.country||'')})</option>`).join('')}</select></div>
            <div class="form-group"><label>Message</label><textarea id="msgContent" placeholder="Type your message..." rows="3" required></textarea></div>
            <button type="submit" class="auth-btn"><i class="fas fa-paper-plane"></i> SEND MESSAGE</button>
        </form>
        <h3 style="margin:20px 0 12px; color:var(--gold-primary);"><i class="fas fa-inbox"></i> Inbox (${received.length})</h3>
        <div style="margin-bottom:20px;">${received.length?received.map(m=>{const from=DB.find('users',m.fromUserId);return `<div class="ticket-row" style="margin-bottom:8px;"><div><strong>From: ${esc(from?.name||'Unknown')}</strong><p class="small">${esc(m.content)}</p><p class="small muted">${new Date(m.sentAt).toLocaleString()}</p></div></div>`;}).join(''):'<p class="muted">No messages received.</p>'}</div>
        <h3 style="margin:20px 0 12px; color:var(--gold-primary);"><i class="fas fa-paper-plane"></i> Sent (${sent.length})</h3>
        <div>${sent.length?sent.map(m=>{const to=DB.find('users',m.toUserId);return `<div class="ticket-row" style="margin-bottom:8px;"><div><strong>To: ${esc(to?.name||'Unknown')}</strong><p class="small">${esc(m.content)}</p><p class="small muted">${new Date(m.sentAt).toLocaleString()}</p></div></div>`;}).join(''):'<p class="muted">No messages sent.</p>'}</div>`;
    document.getElementById('sendMessageForm').addEventListener('submit',e=>{
        e.preventDefault();
        const toUserId=document.getElementById('msgRecipient').value;
        const content=document.getElementById('msgContent').value.trim();
        if(!content||!toUserId)return;
        DB.add('diasporaMessages',{fromUserId:AUTH.current.id,toUserId,content,sentAt:new Date().toISOString()});
        notify('Message sent','success');
        renderDiasporaMessages(wrap);
    });
}

/* ============================================================
   19. CUSTOMER: DIRECTORY
   ============================================================ */
function renderDirectory(){
    const wrap=document.getElementById('directoryGrid');
    wrap.innerHTML=DB.directory.length?DB.directory.map(d=>`<div class="directory-card" onclick="showSpeakerDetail('${d.id}')" style="cursor:pointer;"><div class="directory-card-image"><img src="${esc(d.image||placeholderImage(d.name?.slice(0,20)||'Artist','#ff4d9a','#cc3377'))}" alt="${esc(d.name)}"></div><div class="directory-card-body"><h4>${esc(d.name)}</h4><p class="muted">${esc(d.role)} · ${esc(d.country||'')}</p><p class="small">${esc((d.bio||'').slice(0,80))}${(d.bio||'').length>80?'…':''}</p></div></div>`).join(''):'<p style="text-align:center; padding:40px;">No profiles yet.</p>';
}

window.showSpeakerDetail=function(id){
    const d=DB.find('directory',id);if(!d)return;
    const image=d.image||placeholderImage(d.name?.slice(0,20)||'Artist','#ff4d9a','#cc3377');
    const videos=d.videos||[],music=d.music||[];
    window.showDetailPage(`
        <div class="detail-hero small"><img src="${esc(image)}" alt="${esc(d.name)}"></div>
        <div class="detail-body">
            <h1 class="detail-title">${esc(d.name)}</h1>
            <div class="detail-meta"><span><i class="fas fa-microphone"></i> ${esc(d.role)}</span><span><i class="fas fa-globe"></i> ${esc(d.country)}</span>${d.genre?`<span><i class="fas fa-tag"></i> ${esc(d.genre)}</span>`:''}</div>
            <div class="detail-description"><h3>Biography</h3><p>${esc(d.bio||'No biography available.')}</p></div>
            ${videos.length?`<div class="detail-videos"><h3>Videos</h3><div class="video-grid">${videos.map(v=>`<div class="video-embed"><iframe src="${esc(v)}" frameborder="0" allowfullscreen></iframe></div>`).join('')}</div></div>`:''}
            ${music.length?`<div class="detail-music"><h3>Music / Audio</h3>${music.map(m=>`<audio controls src="${esc(m)}" style="width:100%; margin:8px 0;"></audio>`).join('')}</div>`:''}
        </div>`);
};

/* ============================================================
   20. CUSTOMER: COMPLAINTS & FEEDBACK (Ghartey-style)
   ============================================================ */
let currentComplaintTab='current';
let currentAdminComplaintStatus='all';
let currentAdminComplaintSearch='';

function initCustomerComplaints(){
    document.querySelectorAll('.student-complaints-tab-btn').forEach(btn=>{
        btn.onclick=()=>{
            currentComplaintTab=btn.dataset.complaintTab;
            document.querySelectorAll('.student-complaints-tab-btn').forEach(b=>b.classList.toggle('active-complaints-tab',b.dataset.complaintTab===currentComplaintTab));
            renderMyComplaints();
        };
    });
    renderMyComplaints();
}

window.renderMyComplaints=function(){
    const wrap=document.getElementById('myComplaintsList');if(!wrap||!AUTH.current)return;
    const mine=DB.feedback.filter(f=>f.userId===AUTH.current.id);
    const current=mine.filter(f=>(f.overallStatus||f.status)!=='resolved');
    const history=mine.filter(f=>(f.overallStatus||f.status)==='resolved');
    const list=currentComplaintTab==='current'?current:history;
    if(!list.length){
        wrap.innerHTML=`<div class="empty-state" style="text-align:center; padding:40px 20px;"><i class="fas fa-inbox" style="font-size:3rem; color:var(--text-secondary); margin-bottom:12px;"></i><p>${currentComplaintTab==='current'?'No current complaints.':'No resolved complaints in history.'}</p>${currentComplaintTab==='current'?'<p class="small muted" style="margin-top:8px;">Use the form above to submit a new complaint.</p>':''}</div>`;
        return;
    }
    list.sort((a,b)=>new Date(b.submittedAt||b.createdAt)-new Date(a.submittedAt||a.createdAt));
    wrap.innerHTML=list.map(c=>{
        const overallStatus=c.overallStatus||c.status||'pending';
        const statusClass=overallStatus==='resolved'?'resolved':overallStatus==='in progress'?'in-progress':overallStatus==='acknowledged'?'acknowledged':'pending';
        const statusText=overallStatus==='resolved'?'RESOLVED ✓':overallStatus==='in progress'?'IN PROGRESS':overallStatus==='acknowledged'?'ACKNOWLEDGED':overallStatus==='rejected'?'REJECTED':'PENDING';
        const submittedDate=c.submittedAt||c.createdAt?new Date(c.submittedAt||c.createdAt).toLocaleString():'-';
        const lastUpdate=c.updates&&c.updates.length?c.updates[c.updates.length-1]:null;
        const updateText=lastUpdate?lastUpdate.message||'-':'-';
        const updateDate=lastUpdate&&lastUpdate.timestamp?new Date(lastUpdate.timestamp).toLocaleString():'-';
        const isHistory=currentComplaintTab==='history';
        return `<div class="complaint-card">
            <div class="complaint-card-header"><span class="complaint-id">#${esc(c.id)}</span><span class="complaint-status ${statusClass}">${statusText}</span></div>
            <div class="complaint-category">${esc(c.category||'General')}</div>
            <div class="complaint-title">${esc((c.description||'').substring(0,80))}${(c.description||'').length>80?'...':''}</div>
            <div class="complaint-description"><strong>Location:</strong> ${esc(c.location||'-')}</div>
            <div class="complaint-details">
                <div class="complaint-detail-item"><span class="complaint-detail-label">SUBMITTED</span><span class="complaint-detail-value">${submittedDate}</span></div>
                <div class="complaint-detail-item"><span class="complaint-detail-label">ACKNOWLEDGED BY</span><span class="complaint-detail-value">${esc(c.acknowledgedBy||'-')}</span></div>
                <div class="complaint-detail-item"><span class="complaint-detail-label">EST. FIX TIME</span><span class="complaint-detail-value">${c.estimatedFixTime?new Date(c.estimatedFixTime).toLocaleString():'-'}</span></div>
                <div class="complaint-detail-item"><span class="complaint-detail-label">LATEST UPDATE</span><span class="complaint-detail-value">${esc(updateText)}</span></div>
                <div class="complaint-detail-item"><span class="complaint-detail-label">UPDATE DATE</span><span class="complaint-detail-value">${updateDate}</span></div>
            </div>
            ${isHistory?`<button class="delete-history-btn" onclick="deleteComplaintFromHistory('${c.id}')"><i class="fas fa-trash-alt"></i> Delete from History</button>`:''}
        </div>`;
    }).join('');
};

window.deleteComplaintFromHistory=async function(id){
    if(!(await confirmAction('Remove this complaint from history?')))return;
    const deleted=JSON.parse(localStorage.getItem(`panafest_deleted_complaints_${AUTH.current.id}`)||'[]');
    if(!deleted.includes(id)){deleted.push(id);localStorage.setItem(`panafest_deleted_complaints_${AUTH.current.id}`,JSON.stringify(deleted));}
    notify('Removed from history','info');
    renderMyComplaints();
};

document.getElementById('feedbackForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const btn=e.target.querySelector('button[type="submit"]');
    withLoading(async()=>{
        const complaint={
            userId:AUTH.current.id,
            userName:AUTH.profile.name,
            userEmail:AUTH.profile.email,
            userPhone:AUTH.profile.phone||'',
            category:document.getElementById('feedbackCategory').value,
            location:document.getElementById('feedbackLocation').value.trim(),
            description:document.getElementById('feedbackDescription').value.trim(),
            status:'pending',
            overallStatus:'pending',
            submittedAt:new Date().toISOString(),
            updatedAt:new Date().toISOString(),
            acknowledgedBy:null,
            acknowledgedAt:null,
            estimatedFixTime:null,
            updates:[]
        };
        if(!complaint.category||!complaint.location||!complaint.description)throw new Error('Please fill all fields');
        DB.add('feedback',complaint);
        e.target.reset();
        const statusDiv=document.getElementById('feedbackSubmitStatus');
        if(statusDiv){statusDiv.innerHTML='<i class="fas fa-check-circle"></i> Complaint submitted successfully!';statusDiv.className='request-status success';setTimeout(()=>{statusDiv.innerHTML='';},4000);}
        notify('Complaint submitted','success');
        renderMyComplaints();
    },btn,null,'Failed to submit complaint');
});

document.getElementById('clearFeedbackBtn')?.addEventListener('click',()=>{
    document.getElementById('feedbackCategory').value='';
    document.getElementById('feedbackLocation').value='';
    document.getElementById('feedbackDescription').value='';
    document.getElementById('feedbackSubmitStatus').innerHTML='';
});

/* ============================================================
   21. CUSTOMER: DONATIONS
   ============================================================ */
document.getElementById('donationForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    DB.add('donations',{userId:AUTH.current.id,donorName:AUTH.profile.name,type:document.getElementById('donationType').value,amount:parseFloat(document.getElementById('donationAmount').value),message:document.getElementById('donationMessage').value.trim(),createdAt:new Date().toISOString()});
    e.target.reset();notify('Thank you for your support!','success');renderMyDonations();
});

function renderMyDonations(){
    const wrap=document.getElementById('myDonationsList');if(!wrap||!AUTH.current)return;
    const mine=DB.donations.filter(d=>d.userId===AUTH.current.id);
    wrap.innerHTML=mine.length?mine.map(d=>`<div class="ticket-row"><div><strong>${esc(d.type)}</strong> · GHS ${d.amount}</div><span class="small muted">${new Date(d.createdAt).toLocaleDateString()}</span></div>`).join(''):'<p class="muted" style="text-align:center; padding:20px;">No donations yet.</p>';
}

/* ============================================================
   22. ADMIN: USER MANAGEMENT (with category tabs)
   ============================================================ */
let currentUserMgmtCategory='all';
let currentUserMgmtSearch='';

function initAdminUsers(){
    renderUserMgmtTabs();
    renderAdminUsers();
}

function renderUserMgmtTabs(){
    const tabs=document.getElementById('userMgmtTabs');if(!tabs)return;
    const allCats=[{id:'all',label:'All Users',icon:'fa-users'}].concat(Object.entries(CATEGORY_META).map(([k,v])=>({id:k,label:v.label,icon:v.icon})));
    tabs.innerHTML=allCats.map(c=>`<button class="user-mgmt-tab ${c.id===currentUserMgmtCategory?'active-user-tab':''}" data-category="${c.id}" onclick="filterUserMgmtByCategory('${c.id}')"><i class="fas ${c.icon}"></i> ${c.label}</button>`).join('');
}

window.filterUserMgmtByCategory=function(cat){
    currentUserMgmtCategory=cat;
    document.querySelectorAll('.user-mgmt-tab').forEach(t=>t.classList.toggle('active-user-tab',t.dataset.category===cat));
    renderAdminUsers();
};

function renderAdminUsers(){
    const body=document.getElementById('adminUsersBody');if(!body)return;
    const search=currentUserMgmtSearch.toLowerCase().trim();
    let list=DB.users.filter(u=>u.role!=='admin');
    if(currentUserMgmtCategory!=='all')list=list.filter(u=>u.category===currentUserMgmtCategory);
    if(search)list=list.filter(u=>(u.name||'').toLowerCase().includes(search)||(u.email||'').toLowerCase().includes(search)||(u.phone||'').toLowerCase().includes(search));
    list.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));

    // Stats
    const allUsers=DB.users.filter(u=>u.role!=='admin');
    const catCounts={};
    allUsers.forEach(u=>catCounts[u.category||'unknown']=(catCounts[u.category||'unknown']||0)+1);
    const stats=document.getElementById('userMgmtStats');
    if(stats){
        stats.innerHTML=`
            <div class="metric-card"><div class="metric-label">Total Users</div><div class="metric-value">${allUsers.length}</div></div>
            <div class="metric-card"><div class="metric-label">Filtered</div><div class="metric-value">${list.length}</div></div>
            <div class="metric-card"><div class="metric-label">Active</div><div class="metric-value">${allUsers.filter(u=>(u.status||'active')==='active').length}</div></div>
            <div class="metric-card"><div class="metric-label">Suspended</div><div class="metric-value">${allUsers.filter(u=>u.status==='suspended').length}</div></div>
        `;
    }

    if(!list.length){body.innerHTML='<tr><td colspan="8" style="text-align:center; padding:20px;">No users in this category.</td></tr>';return;}
    body.innerHTML=list.map(u=>`
        <tr>
            <td><strong>${esc(u.name)}</strong></td>
            <td>${esc(u.email)}</td>
            <td>${esc(u.phone||'-')}</td>
            <td><span class="status-badge">${esc(u.category||'')}</span></td>
            <td>${esc(u.country||'')}</td>
            <td><span class="status-badge ${u.status==='suspended'?'status-danger':'status-success'}">${esc((u.status||'active').toUpperCase())}</span></td>
            <td>${u.createdAt?new Date(u.createdAt).toLocaleDateString():'-'}</td>
            <td><button class="action-btn" onclick="toggleUserStatus('${u.id}')"><i class="fas fa-${u.status==='suspended'?'check':'ban'}"></i> ${u.status==='suspended'?'Activate':'Suspend'}</button></td>
        </tr>`).join('');
}

window.toggleUserStatus=async function(id){
    const u=DB.find('users',id);if(!u)return;
    const next=u.status==='suspended'?'active':'suspended';
    if(!(await confirmAction(`Set ${u.name} to ${next}?`)))return;
    DB.update('users',id,{status:next});
    notify(`User set to ${next}`,'success');
    renderAdminUsers();
};

document.getElementById('adminUserSearchBtn')?.addEventListener('click',()=>{currentUserMgmtSearch=document.getElementById('adminUserSearch').value;renderAdminUsers();});
document.getElementById('adminUserSearch')?.addEventListener('keyup',e=>{if(e.key==='Enter'){currentUserMgmtSearch=e.target.value;renderAdminUsers();}});

/* ============================================================
   23. ADMIN: PROGRAM MANAGEMENT
   ============================================================ */
let apPendingImage=null;
document.getElementById('apImage')?.addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file){apPendingImage=null;document.getElementById('apImagePreview').style.display='none';return;}
    try{apPendingImage=await fileToCompressedDataUrl(file,600,0.75);document.getElementById('apImagePreviewImg').src=apPendingImage;document.getElementById('apImagePreview').style.display='block';}catch{notify('Image processing failed','error');}
});

document.getElementById('adminProgramForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const videos=document.getElementById('apVideos').value.split('\n').map(v=>v.trim()).filter(Boolean);
    DB.add('programs',{title:document.getElementById('apTitle').value.trim(),category:document.getElementById('apCategory').value.trim(),date:document.getElementById('apDate').value,venue:document.getElementById('apVenue').value.trim(),description:document.getElementById('apDescription').value.trim(),individualPrice:parseFloat(document.getElementById('apIndividualPrice').value)||0,groupPrice:parseFloat(document.getElementById('apGroupPrice').value)||0,image:apPendingImage||placeholderImage(document.getElementById('apTitle').value.trim().slice(0,20)||'Program'),videos,createdAt:new Date().toISOString()});
    e.target.reset();apPendingImage=null;document.getElementById('apImagePreview').style.display='none';
    notify('Program created','success');renderAdminPrograms();
});

function renderAdminPrograms(){
    document.getElementById('adminProgramsList').innerHTML=DB.programs.map(p=>`
        <div class="program-card">
            <div class="program-card-image"><img src="${esc(p.image||placeholderImage(p.title?.slice(0,20)||'Program'))}" alt="${esc(p.title)}"></div>
            <div class="program-card-body">
                <h4>${esc(p.title)}</h4>
                <p class="muted">${esc(p.category)}</p>
                <p class="small">${p.date?new Date(p.date).toLocaleString():''}</p>
                <p class="small">${esc(p.venue)}</p>
                <div style="display:flex; gap:6px; margin-top:8px;">
                    <button class="action-btn" onclick="openAdminEditModal('program','${p.id}')" style="color:var(--gold-primary); border-color:var(--gold-primary);"><i class="fas fa-edit"></i> Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteProgram('${p.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>`).join('')||'<p class="muted">No programs.</p>';
}

window.deleteProgram=async function(id){if(!(await confirmAction('Delete this program?')))return;DB.remove('programs',id);notify('Program deleted','success');renderAdminPrograms();};

function renderAdminProgramRegistrations(){
    const body=document.getElementById('adminProgramRegistrationsBody');if(!body)return;
    if(!DB.programRegistrations.length){body.innerHTML='<tr><td colspan="8" style="text-align:center; padding:20px;">No program registrations yet.</td></tr>';return;}
    body.innerHTML=[...DB.programRegistrations].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(r=>`<tr><td>${esc(r.reference)}</td><td>${esc(r.programTitle)}</td><td>${esc(r.userName)}</td><td><span class="status-badge">${esc(r.type)}</span></td><td>${r.quantity}</td><td class="price">GHS ${(r.total||0).toFixed(2)}</td><td>${esc(r.paymentMethod)} · ${esc(r.mobileMoney)}</td><td>${new Date(r.createdAt).toLocaleString()}</td></tr>`).join('');
}

/* ============================================================
   24. ADMIN: EVENT SCHEDULE MANAGEMENT (NEW)
   ============================================================ */
document.getElementById('adminEventForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    DB.add('events',{title:document.getElementById('aeTitle').value.trim(),date:document.getElementById('aeDate').value,venue:document.getElementById('aeVenue').value.trim(),description:document.getElementById('aeDescription').value.trim(),createdAt:new Date().toISOString()});
    e.target.reset();
    notify('Event added','success');renderAdminEventSchedule();
});

function renderAdminEventSchedule(){
    const wrap=document.getElementById('adminEventScheduleList');if(!wrap)return;
    if(!DB.events.length){wrap.innerHTML='<p class="muted" style="text-align:center; padding:20px;">No events yet. Add one above.</p>';return;}
    const groups={};
    DB.events.forEach(ev=>{const k=new Date(ev.date).toISOString().slice(0,10);if(!groups[k])groups[k]=[];groups[k].push(ev);});
    const days=Object.keys(groups).sort();
    const today=new Date().toISOString().slice(0,10);
    wrap.innerHTML=days.map(dayKey=>{
        const events=groups[dayKey].sort((a,b)=>new Date(a.date)-new Date(b.date));
        const dateObj=new Date(dayKey);
        const isToday=dayKey===today;
        return `<div class="admin-event-day ${isToday?'admin-event-today':''}"><div class="admin-event-day-header"><i class="fas fa-calendar-day"></i> ${dateObj.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})} ${isToday?'<span class="status-badge status-success" style="margin-left:8px;">TODAY</span>':''}</div>${events.map(ev=>`<div class="admin-event-row"><div class="admin-event-time">${new Date(ev.date).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div><div class="admin-event-info"><strong>${esc(ev.title)}</strong><p class="small"><i class="fas fa-map-marker-alt"></i> ${esc(ev.venue||'')}${ev.description?' · '+esc(ev.description):''}</p></div><div class="admin-event-actions"><button class="action-btn" onclick="openAdminEditModal('event','${ev.id}')" style="color:var(--gold-primary); border-color:var(--gold-primary);"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn" onclick="deleteEvent('${ev.id}')"><i class="fas fa-trash"></i></button></div></div>`).join('')}</div>`;
    }).join('');
}

window.deleteEvent=async function(id){if(!(await confirmAction('Delete this event?')))return;DB.remove('events',id);notify('Event deleted','success');renderAdminEventSchedule();};

/* ============================================================
   25. ADMIN: TICKETS
   ============================================================ */
function renderAdminTickets(){
    const total=DB.tickets.length;const valid=DB.tickets.filter(t=>t.status==='valid').length;const revenue=DB.tickets.reduce((s,t)=>s+(t.price||0),0);
    document.getElementById('adminTicketsStats').innerHTML=`<div class="metric-card"><div class="metric-label">Total Tickets</div><div class="metric-value">${total}</div></div><div class="metric-card"><div class="metric-label">Valid</div><div class="metric-value">${valid}</div></div><div class="metric-card"><div class="metric-label">Revenue (GHS)</div><div class="metric-value">${revenue}</div></div>`;
    document.getElementById('adminTicketsBody').innerHTML=DB.tickets.map(t=>`<tr><td>${esc(t.code||t.id)}</td><td>${esc(t.userName||'')}</td><td>${esc(t.type)}</td><td><span class="status-badge ${t.status==='valid'?'status-success':'status-danger'}">${t.status.toUpperCase()}</span></td><td>${new Date(t.issuedAt).toLocaleDateString()}</td><td><button class="action-btn" onclick="validateTicket('${t.id}')"><i class="fas fa-check"></i> Validate</button></td></tr>`).join('')||'<tr><td colspan="6" style="text-align:center; padding:20px;">No tickets yet.</td></tr>';
}
window.validateTicket=function(id){DB.update('tickets',id,{status:'validated',validatedAt:new Date().toISOString()});notify('Ticket validated','success');renderAdminTickets();};

function renderAdminTransactions(){
    const body=document.getElementById('adminTransactionsBody');if(!body)return;
    if(!DB.transactions.length){body.innerHTML='<tr><td colspan="8" style="text-align:center; padding:20px;">No transactions yet.</td></tr>';return;}
    body.innerHTML=[...DB.transactions].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(t=>`<tr><td>${esc(t.reference||t.id)}</td><td>${esc(t.userName||'')}</td><td>${esc(t.item||t.type)}</td><td class="price">GHS ${(t.amount||0).toFixed(2)}</td><td>${esc(t.paymentMethod||'')}</td><td>${esc(t.mobileMoney||'')}</td><td><span class="status-badge ${t.status==='completed'?'status-success':'status-warning'}">${esc((t.status||'').toUpperCase())}</span></td><td>${new Date(t.createdAt).toLocaleString()}</td></tr>`).join('');
}

/* ============================================================
   26. ADMIN: ACCOMMODATION
   ============================================================ */
let aaPendingImage=null,aaPendingGallery=[];
document.getElementById('aaImage')?.addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file){aaPendingImage=null;document.getElementById('aaImagePreview').style.display='none';return;}
    try{aaPendingImage=await fileToCompressedDataUrl(file,600,0.75);document.getElementById('aaImagePreviewImg').src=aaPendingImage;document.getElementById('aaImagePreview').style.display='block';}catch{notify('Image processing failed','error');}
});
document.getElementById('aaGallery')?.addEventListener('change',async e=>{
    const files=Array.from(e.target.files);aaPendingGallery=[];
    const wrap=document.getElementById('aaGalleryPreview');wrap.innerHTML='';
    for(const file of files){try{const url=await fileToCompressedDataUrl(file,500,0.7);if(url){aaPendingGallery.push(url);const img=document.createElement('img');img.src=url;img.style.cssText='width:60px; height:60px; object-fit:cover; border-radius:6px; border:1px solid var(--glass-edge);';wrap.appendChild(img);}}catch{}}
});
document.getElementById('adminAccommodationForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const videos=document.getElementById('aaVideos').value.split('\n').map(v=>v.trim()).filter(Boolean);
    DB.add('accommodations',{name:document.getElementById('aaName').value.trim(),type:document.getElementById('aaType').value,location:document.getElementById('aaLocation').value.trim(),price:parseFloat(document.getElementById('aaPrice').value),rooms:parseInt(document.getElementById('aaRooms').value,10),contact:document.getElementById('aaContact').value.trim(),description:document.getElementById('aaDescription').value.trim(),image:aaPendingImage||placeholderImage(document.getElementById('aaName').value.trim().slice(0,20)||'Hotel'),gallery:aaPendingGallery.slice(),videos,createdAt:new Date().toISOString()});
    e.target.reset();aaPendingImage=null;aaPendingGallery=[];
    document.getElementById('aaImagePreview').style.display='none';document.getElementById('aaGalleryPreview').innerHTML='';
    notify('Accommodation added','success');renderAdminAccommodation();
});

function renderAdminAccommodation(){
    document.getElementById('adminAccommodationList').innerHTML=DB.accommodations.map(a=>`
        <div class="admin-product-row">
            <div class="admin-product-thumb"><img src="${esc(a.image||placeholderImage(a.name?.slice(0,20)||'Hotel'))}" style="width:56px; height:56px; object-fit:cover; border-radius:8px;"></div>
            <div class="admin-product-details"><strong>${esc(a.name)}</strong><p class="small">${esc(a.type)} · ${esc(a.location)} · GHS ${a.price}/night · ${a.rooms} rooms</p></div>
            <div class="admin-product-actions">
                <button class="action-btn" onclick="openAdminEditModal('accommodation','${a.id}')" style="color:var(--gold-primary); border-color:var(--gold-primary);"><i class="fas fa-edit"></i> Edit</button>
                <button class="action-btn delete-btn" onclick="deleteAccommodation('${a.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>`).join('')||'<p class="muted">No accommodations.</p>';
}
window.deleteAccommodation=async function(id){if(!(await confirmAction('Delete?')))return;DB.remove('accommodations',id);notify('Deleted','success');renderAdminAccommodation();};

function renderAdminBookings(){
    const body=document.getElementById('adminBookingsBody');if(!body)return;
    if(!DB.bookings.length){body.innerHTML='<tr><td colspan="9" style="text-align:center; padding:20px;">No bookings yet.</td></tr>';return;}
    body.innerHTML=[...DB.bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(b=>`<tr><td>${esc(b.reference||b.id)}</td><td>${esc(b.userName||'')}</td><td>${esc(b.accommodationName)}</td><td><span class="status-badge">${esc(b.type||'individual')}</span></td><td>${b.nights||1}</td><td>${b.rooms||1}</td><td class="price">GHS ${(b.total||0).toFixed(2)}</td><td><span class="status-badge ${b.status==='pending'?'status-warning':'status-success'}">${esc((b.status||'pending').toUpperCase())}</span></td><td>${b.status==='pending'?`<button class="action-btn" onclick="approveBooking('${b.id}')"><i class="fas fa-check"></i> Approve</button>`:''}</td></tr>`).join('');
}
window.approveBooking=function(id){DB.update('bookings',id,{status:'confirmed'});notify('Booking approved','success');renderAdminBookings();};

/* ============================================================
   27. ADMIN: MARKETPLACE
   ============================================================ */
let avPendingImage=null;
document.getElementById('avImage')?.addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file){avPendingImage=null;document.getElementById('avImagePreview').style.display='none';return;}
    try{avPendingImage=await fileToCompressedDataUrl(file,500,0.7);document.getElementById('avImagePreviewImg').src=avPendingImage;document.getElementById('avImagePreview').style.display='block';}catch{notify('Image processing failed','error');}
});
document.getElementById('adminVendorForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    DB.add('vendors',{name:document.getElementById('avName').value.trim(),owner:document.getElementById('avOwner').value.trim(),category:document.getElementById('avCategory').value.trim(),contact:document.getElementById('avContact').value.trim(),description:document.getElementById('avDescription').value.trim(),image:avPendingImage||placeholderImage(document.getElementById('avName').value.trim().slice(0,20)||'Vendor','#b96bff','#8844cc'),createdAt:new Date().toISOString()});
    e.target.reset();avPendingImage=null;document.getElementById('avImagePreview').style.display='none';
    notify('Vendor added','success');renderAdminMarketplace();
});

let apProductPendingImage=null;
document.getElementById('apProductImage')?.addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file){apProductPendingImage=null;document.getElementById('apProductImagePreview').style.display='none';return;}
    try{apProductPendingImage=await fileToCompressedDataUrl(file,500,0.7);document.getElementById('apProductImagePreviewImg').src=apProductPendingImage;document.getElementById('apProductImagePreview').style.display='block';}catch{notify('Image processing failed','error');}
});
document.getElementById('adminProductForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const vendorId=document.getElementById('apVendorSelect').value;
    const vendor=DB.find('vendors',vendorId);
    if(!vendor){notify('Please select a vendor','error');return;}
    DB.add('products',{title:document.getElementById('apProductTitle').value.trim(),description:document.getElementById('apProductDesc').value.trim(),category:document.getElementById('apProductCategory').value,price:parseFloat(document.getElementById('apProductPrice').value),contact:document.getElementById('apProductContact').value.trim(),image:apProductPendingImage||placeholderImage(document.getElementById('apProductTitle').value.trim().slice(0,20)||'Product'),sellerName:vendor.name,sellerId:vendor.id,vendorId:vendor.id,status:'approved',createdAt:new Date().toISOString()});
    e.target.reset();apProductPendingImage=null;document.getElementById('apProductImagePreview').style.display='none';
    notify('Product added and approved','success');renderAdminMarketplace();
});

function renderAdminMarketplace(){
    const select=document.getElementById('apVendorSelect');
    if(select){const current=select.value;select.innerHTML='<option value="">— Select Vendor —</option>'+DB.vendors.map(v=>`<option value="${v.id}">${esc(v.name)}</option>`).join('');if(current&&DB.vendors.some(v=>v.id===current))select.value=current;}

    document.getElementById('adminVendorsList').innerHTML=DB.vendors.map(v=>`
        <div class="admin-product-row">
            <div class="admin-product-thumb"><img src="${esc(v.image||placeholderImage(v.name?.slice(0,20)||'Vendor','#b96bff','#8844cc'))}" style="width:56px; height:56px; object-fit:cover; border-radius:8px;"></div>
            <div class="admin-product-details"><strong>${esc(v.name)}</strong><p class="small">${esc(v.category)} · ${esc(v.owner||'')} · ${esc(v.contact)}</p></div>
            <div class="admin-product-actions">
                <button class="action-btn" onclick="openAdminEditModal('vendor','${v.id}')" style="color:var(--gold-primary); border-color:var(--gold-primary);"><i class="fas fa-edit"></i> Edit</button>
                <button class="action-btn delete-btn" onclick="deleteVendor('${v.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>`).join('')||'<p class="muted">No vendors.</p>';

    const wrap=document.getElementById('adminProductsList');
    if(!DB.products.length){wrap.innerHTML='<p class="muted" style="text-align:center; padding:20px;">No product listings yet.</p>';return;}
    wrap.innerHTML=DB.products.map(p=>{
        const statusClass=p.status==='approved'?'status-success':p.status==='rejected'?'status-danger':'status-warning';
        const imageHtml=p.image?`<img src="${esc(p.image)}" style="width:56px; height:56px; object-fit:cover; border-radius:8px;">`:`<i class="fas fa-image" style="font-size:1.8rem; color:var(--text-secondary);"></i>`;
        return `<div class="admin-product-row"><div class="admin-product-thumb">${imageHtml}</div><div class="admin-product-details"><strong>${esc(p.title)}</strong><p class="small">${esc(p.category)} · GHS ${(p.price||0).toFixed(2)} · Seller: ${esc(p.sellerName||'—')}</p><p class="small">${esc((p.description||'').slice(0,100))}</p><span class="status-badge ${statusClass}">${(p.status||'pending').toUpperCase()}</span></div><div class="admin-product-actions">${p.status!=='approved'?`<button class="action-btn" onclick="approveProduct('${p.id}')" style="color:var(--success-glow); border-color:var(--success-glow);"><i class="fas fa-check"></i> Approve</button>`:''}${p.status!=='rejected'?`<button class="action-btn" onclick="rejectProduct('${p.id}')" style="color:var(--danger-glow); border-color:var(--danger-glow);"><i class="fas fa-times"></i> Reject</button>`:''}<button class="action-btn" onclick="openAdminEditModal('product','${p.id}')" style="color:var(--gold-primary); border-color:var(--gold-primary);"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button></div></div>`;
    }).join('');
}
window.deleteVendor=async function(id){if(!(await confirmAction('Delete vendor?')))return;DB.remove('vendors',id);notify('Vendor deleted','success');renderAdminMarketplace();};
window.approveProduct=function(id){DB.update('products',id,{status:'approved',approvedAt:new Date().toISOString()});notify('Product approved','success');renderAdminMarketplace();};
window.rejectProduct=function(id){DB.update('products',id,{status:'rejected',rejectedAt:new Date().toISOString()});notify('Product rejected','info');renderAdminMarketplace();};
window.deleteProduct=async function(id){if(!(await confirmAction('Delete this product?')))return;DB.remove('products',id);notify('Product deleted','success');renderAdminMarketplace();};

/* ============================================================
   28. ADMIN: MEDIA
   ============================================================ */
document.getElementById('adminMediaForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    DB.add('media',{type:document.getElementById('amType').value,title:document.getElementById('amTitle').value.trim(),url:document.getElementById('amUrl').value.trim(),description:document.getElementById('amDescription').value.trim(),createdAt:new Date().toISOString()});
    e.target.reset();notify('Media added','success');renderAdminMedia();
});
function renderAdminMedia(){
    document.getElementById('adminMediaList').innerHTML=DB.media.map(m=>`<div class="ticket-row"><div><strong>${esc(m.title)}</strong><p class="small">${esc(m.type)}</p></div><div style="display:flex; gap:6px;"><button class="action-btn" onclick="openAdminEditModal('media','${m.id}')" style="color:var(--gold-primary); border-color:var(--gold-primary);"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn" onclick="deleteMedia('${m.id}')"><i class="fas fa-trash"></i></button></div></div>`).join('')||'<p class="muted">No media.</p>';
}
window.deleteMedia=async function(id){if(!(await confirmAction('Delete?')))return;DB.remove('media',id);notify('Deleted','success');renderAdminMedia();};

/* ============================================================
   29. ADMIN: DIRECTORY
   ============================================================ */
let adPendingImage=null;
document.getElementById('adImage')?.addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file){adPendingImage=null;document.getElementById('adImagePreview').style.display='none';return;}
    try{adPendingImage=await fileToCompressedDataUrl(file,500,0.7);document.getElementById('adImagePreviewImg').src=adPendingImage;document.getElementById('adImagePreview').style.display='block';}catch{notify('Image processing failed','error');}
});
document.getElementById('adminDirectoryForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const videos=document.getElementById('adVideos').value.split('\n').map(v=>v.trim()).filter(Boolean);
    const music=document.getElementById('adMusic').value.split('\n').map(v=>v.trim()).filter(Boolean);
    DB.add('directory',{name:document.getElementById('adName').value.trim(),role:document.getElementById('adRole').value,country:document.getElementById('adCountry').value.trim(),genre:document.getElementById('adGenre').value.trim(),bio:document.getElementById('adBio').value.trim(),image:adPendingImage||placeholderImage(document.getElementById('adName').value.trim().slice(0,20)||'Artist','#ff4d9a','#cc3377'),videos,music,createdAt:new Date().toISOString()});
    e.target.reset();adPendingImage=null;document.getElementById('adImagePreview').style.display='none';
    notify('Profile added','success');renderAdminDirectory();
});
function renderAdminDirectory(){
    document.getElementById('adminDirectoryList').innerHTML=DB.directory.map(d=>`
        <div class="admin-product-row">
            <div class="admin-product-thumb"><img src="${esc(d.image||placeholderImage(d.name?.slice(0,20)||'Artist','#ff4d9a','#cc3377'))}" style="width:56px; height:56px; object-fit:cover; border-radius:8px;"></div>
            <div class="admin-product-details"><strong>${esc(d.name)}</strong><p class="small">${esc(d.role)} · ${esc(d.country)}</p><p class="small">${esc((d.bio||'').slice(0,100))}</p></div>
            <div class="admin-product-actions">
                <button class="action-btn" onclick="openAdminEditModal('directory','${d.id}')" style="color:var(--gold-primary); border-color:var(--gold-primary);"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" onclick="deleteDirectory('${d.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>`).join('')||'<p class="muted">No profiles.</p>';
}
window.deleteDirectory=async function(id){if(!(await confirmAction('Delete?')))return;DB.remove('directory',id);notify('Deleted','success');renderAdminDirectory();};

/* ============================================================
   30. ADMIN: HERITAGE MANAGEMENT (NEW)
   ============================================================ */
document.getElementById('adminHeritageForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    DB.add('heritage',{category:document.getElementById('ahCategory').value,title:document.getElementById('ahTitle').value.trim(),description:document.getElementById('ahDescription').value.trim(),url:document.getElementById('ahUrl').value.trim()||'',createdAt:new Date().toISOString()});
    e.target.reset();notify('Heritage resource added','success');renderAdminHeritage();
});

function renderAdminHeritage(){
    const wrap=document.getElementById('adminHeritageList');if(!wrap)return;
    if(!DB.heritage.length){wrap.innerHTML='<p class="muted" style="text-align:center; padding:20px;">No resources yet.</p>';return;}
    const grouped={};
    DB.heritage.forEach(h=>{const k=h.category||'Other';if(!grouped[k])grouped[k]=[];grouped[k].push(h);});
    wrap.innerHTML=Object.keys(grouped).map(cat=>`<div class="admin-subsection"><h4 style="color:var(--gold-primary); margin-bottom:10px;"><i class="fas fa-folder"></i> ${esc(cat)} (${grouped[cat].length})</h4>${grouped[cat].map(h=>`<div class="ticket-row" style="margin-bottom:6px;"><div><strong>${esc(h.title)}</strong><p class="small">${esc((h.description||'').slice(0,120))}</p>${h.url?`<p class="small"><a href="${esc(h.url)}" target="_blank" style="color:var(--gold-primary);">${esc(h.url)}</a></p>`:''}</div><div style="display:flex; gap:6px;"><button class="action-btn" onclick="openAdminEditModal('heritage','${h.id}')" style="color:var(--gold-primary); border-color:var(--gold-primary);"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn" onclick="deleteHeritage('${h.id}')"><i class="fas fa-trash"></i></button></div></div>`).join('')}</div>`).join('');
}
window.deleteHeritage=async function(id){if(!(await confirmAction('Delete this resource?')))return;DB.remove('heritage',id);notify('Deleted','success');renderAdminHeritage();};

/* ============================================================
   31. ADMIN: COMPLAINTS (Ghartey-style)
   ============================================================ */
function initAdminComplaints(){
    document.querySelectorAll('.complaints-tab-btn').forEach(btn=>{
        btn.onclick=()=>{
            currentAdminComplaintStatus=btn.dataset.status;
            document.querySelectorAll('.complaints-tab-btn').forEach(b=>b.classList.toggle('active-complaints-tab',b.dataset.status===currentAdminComplaintStatus));
            renderAdminComplaints();
        };
    });
    renderAdminComplaints();
}

function renderAdminComplaints(){
    const body=document.getElementById('adminComplaintsBody');if(!body)return;
    const deletedIds=[]; // admin sees all complaints
    let list=[...DB.feedback];
    if(currentAdminComplaintStatus!=='all')list=list.filter(c=>(c.overallStatus||c.status)===currentAdminComplaintStatus);
    if(currentAdminComplaintSearch){
        const s=currentAdminComplaintSearch.toLowerCase();
        list=list.filter(c=>(c.id||'').toLowerCase().includes(s)||(c.userName||'').toLowerCase().includes(s)||(c.userEmail||'').toLowerCase().includes(s)||(c.location||'').toLowerCase().includes(s)||(c.category||'').toLowerCase().includes(s)||(c.description||'').toLowerCase().includes(s));
    }
    list.sort((a,b)=>new Date(b.submittedAt||b.createdAt)-new Date(a.submittedAt||a.createdAt));
    if(!list.length){body.innerHTML='<tr><td colspan="12" style="text-align:center; padding:20px;">No complaints found.</td></tr>';return;}
    body.innerHTML=list.map(c=>{
        const overallStatus=c.overallStatus||c.status||'pending';
        const statusClass=overallStatus==='resolved'?'status-success':overallStatus==='in progress'?'status-warning':overallStatus==='acknowledged'?'status-info':overallStatus==='rejected'?'status-danger':'status-warning';
        const submittedDate=c.submittedAt||c.createdAt?new Date(c.submittedAt||c.createdAt).toLocaleString():'-';
        const lastUpdate=c.updates&&c.updates.length?c.updates[c.updates.length-1].message:'';
        return `<tr>
            <td>${esc(c.id||'')}</td>
            <td>${esc(c.userName||'')}</td>
            <td>${esc(c.userEmail||'')}</td>
            <td>${esc(c.category||'')}</td>
            <td>${esc((c.description||'').slice(0,50))}${(c.description||'').length>50?'...':''}</td>
            <td>${esc(c.location||'')}</td>
            <td><span class="status-badge ${statusClass}">${esc(overallStatus.toUpperCase())}</span></td>
            <td>${submittedDate}</td>
            <td>${esc(c.acknowledgedBy||'-')}</td>
            <td>${c.estimatedFixTime?new Date(c.estimatedFixTime).toLocaleString():'-'}</td>
            <td>${esc((lastUpdate||'-').slice(0,40))}</td>
            <td><button class="action-btn" onclick="openComplaintUpdateModal('${c.id}')" style="color:var(--gold-primary); border-color:var(--gold-primary);"><i class="fas fa-pen"></i> Update</button></td>
        </tr>`;
    }).join('');
}

document.getElementById('adminComplaintsSearchBtn')?.addEventListener('click',()=>{currentAdminComplaintSearch=document.getElementById('adminComplaintsSearch').value;renderAdminComplaints();});
document.getElementById('adminComplaintsSearch')?.addEventListener('keyup',e=>{if(e.key==='Enter'){currentAdminComplaintSearch=e.target.value;renderAdminComplaints();}});

window.openComplaintUpdateModal=function(id){
    const c=DB.find('feedback',id);if(!c)return;
    document.getElementById('updateComplaintId').value=id;
    document.getElementById('complaintAcknowledge').value=c.status||'pending';
    document.getElementById('complaintOverallStatus').value=c.overallStatus||c.status||'pending';
    document.getElementById('complaintEstFixTime').value=c.estimatedFixTime?c.estimatedFixTime.slice(0,16):'';
    document.getElementById('complaintUpdateMessage').value='';
    document.getElementById('complaintUpdateModal').style.display='flex';
};

document.getElementById('closeComplaintUpdateBtn')?.addEventListener('click',()=>{document.getElementById('complaintUpdateModal').style.display='none';});

document.getElementById('submitComplaintUpdateBtn')?.addEventListener('click',async()=>{
    const btn=document.getElementById('submitComplaintUpdateBtn');
    await withLoading(async()=>{
        const id=document.getElementById('updateComplaintId').value;
        const c=DB.find('feedback',id);
        if(!c)throw new Error('Complaint not found');
        const newAckStatus=document.getElementById('complaintAcknowledge').value;
        const newOverall=document.getElementById('complaintOverallStatus').value;
        const estFix=document.getElementById('complaintEstFixTime').value;
        const msg=document.getElementById('complaintUpdateMessage').value.trim();
        const changes={status:newAckStatus,overallStatus:newOverall,updatedAt:new Date().toISOString()};
        if(estFix)changes.estimatedFixTime=estFix;
        if(newAckStatus==='acknowledged'&&!c.acknowledgedBy){changes.acknowledgedBy=AUTH.profile?.name||'Admin';changes.acknowledgedAt=new Date().toISOString();}
        if(msg){
            const updates=c.updates||[];
            updates.push({message:msg,status:newOverall,updatedBy:AUTH.profile?.name||'Admin',timestamp:new Date().toISOString()});
            changes.updates=updates;
        }
        DB.update('feedback',id,changes);
        document.getElementById('complaintUpdateModal').style.display='none';
        notify('Complaint updated','success');
        renderAdminComplaints();
    },btn,null,'Failed to update complaint');
});

/* ============================================================
   32. ADMIN: REPORTS
   ============================================================ */
let charts={};
function renderAdminReports(){
    const totalUsers=DB.users.filter(u=>u.role!=='admin').length;
    const totalTickets=DB.tickets.length;
    const totalRevenue=DB.tickets.reduce((s,t)=>s+(t.price||0),0);
    const totalDonations=DB.donations.reduce((s,d)=>s+(d.amount||0),0);
    document.getElementById('reportsMetrics').innerHTML=`<div class="metric-card"><div class="metric-label">Users</div><div class="metric-value">${totalUsers}</div></div><div class="metric-card"><div class="metric-label">Tickets</div><div class="metric-value">${totalTickets}</div></div><div class="metric-card"><div class="metric-label">Revenue</div><div class="metric-value">${totalRevenue}</div></div><div class="metric-card"><div class="metric-label">Donations</div><div class="metric-value">${totalDonations}</div></div>`;
    ['chartRegistrations','chartTickets','chartDonations','chartPrograms'].forEach(id=>{if(charts[id]){charts[id].destroy();delete charts[id];}});
    const goldPalette=['#FFD700','#DAA520','#B8860B','#8a6d0f','#5a480a','#3a2f08','#1a1505'];
    const catCounts={};
    DB.users.filter(u=>u.role!=='admin').forEach(u=>{const k=u.category||'unknown';catCounts[k]=(catCounts[k]||0)+1;});
    charts.chartRegistrations=new Chart(document.getElementById('chartRegistrations'),{type:'doughnut',data:{labels:Object.keys(catCounts).length?Object.keys(catCounts):['None'],datasets:[{data:Object.values(catCounts).length?Object.values(catCounts):[1],backgroundColor:goldPalette}]},options:{plugins:{legend:{labels:{color:'#f5f5f0'}}}}});
    const ticketCounts={};
    DB.tickets.forEach(t=>ticketCounts[t.type]=(ticketCounts[t.type]||0)+1);
    charts.chartTickets=new Chart(document.getElementById('chartTickets'),{type:'bar',data:{labels:Object.keys(ticketCounts).length?Object.keys(ticketCounts):['None'],datasets:[{label:'Count',data:Object.values(ticketCounts).length?Object.values(ticketCounts):[0],backgroundColor:'#FFD700'}]},options:{plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#f5f5f0'}},y:{ticks:{color:'#f5f5f0'}}}}});
    const donByDay={};
    DB.donations.forEach(d=>{const day=new Date(d.createdAt).toLocaleDateString();donByDay[day]=(donByDay[day]||0)+(d.amount||0);});
    charts.chartDonations=new Chart(document.getElementById('chartDonations'),{type:'line',data:{labels:Object.keys(donByDay).length?Object.keys(donByDay):['No data'],datasets:[{label:'GHS',data:Object.values(donByDay).length?Object.values(donByDay):[0],borderColor:'#DAA520',backgroundColor:'rgba(218,165,32,0.2)',fill:true,tension:0.4}]},options:{plugins:{legend:{labels:{color:'#f5f5f0'}}},scales:{x:{ticks:{color:'#f5f5f0'}},y:{ticks:{color:'#f5f5f0'}}}}});
    const progCounts={};
    DB.programs.forEach(p=>progCounts[p.category||'Other']=(progCounts[p.category||'Other']||0)+1);
    charts.chartPrograms=new Chart(document.getElementById('chartPrograms'),{type:'bar',data:{labels:Object.keys(progCounts).length?Object.keys(progCounts):['None'],datasets:[{label:'Programs',data:Object.values(progCounts).length?Object.values(progCounts):[0],backgroundColor:'#B8860B'}]},options:{plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#f5f5f0'}},y:{ticks:{color:'#f5f5f0'}}}}});
}

/* ============================================================
   33. GENERIC ADMIN EDIT MODAL
   ============================================================ */
const EDIT_SCHEMAS={
    program:{title:'Edit Program',collection:'programs',fields:[
        {id:'title',label:'Title',type:'text'},{id:'category',label:'Category',type:'text'},
        {id:'date',label:'Date',type:'datetime-local'},{id:'venue',label:'Venue',type:'text'},
        {id:'individualPrice',label:'Individual Price (GHS)',type:'number'},{id:'groupPrice',label:'Group Price (GHS)',type:'number'},
        {id:'description',label:'Description',type:'textarea'},
        {id:'image',label:'Program Image',type:'image'},
        {id:'videos',label:'Videos (one URL per line)',type:'textarea',multiline:true}
    ]},
    accommodation:{title:'Edit Accommodation',collection:'accommodations',fields:[
        {id:'name',label:'Name',type:'text'},{id:'type',label:'Type',type:'text'},
        {id:'location',label:'Location',type:'text'},{id:'price',label:'Price per Night (GHS)',type:'number'},
        {id:'rooms',label:'Rooms',type:'number'},{id:'contact',label:'Contact',type:'text'},
        {id:'description',label:'Description',type:'textarea'},
        {id:'image',label:'Main Image',type:'image'},
        {id:'videos',label:'Videos (one URL per line)',type:'textarea',multiline:true}
    ]},
    vendor:{title:'Edit Vendor',collection:'vendors',fields:[
        {id:'name',label:'Vendor Name',type:'text'},{id:'owner',label:'Owner',type:'text'},
        {id:'category',label:'Category',type:'text'},{id:'contact',label:'Contact',type:'text'},
        {id:'description',label:'Description',type:'textarea'},
        {id:'image',label:'Shop Image',type:'image'}
    ]},
    product:{title:'Edit Product',collection:'products',fields:[
        {id:'title',label:'Product Title',type:'text'},{id:'category',label:'Category',type:'text'},
        {id:'price',label:'Price (GHS)',type:'number'},{id:'contact',label:'Contact',type:'text'},
        {id:'description',label:'Description',type:'textarea'},
        {id:'image',label:'Product Image',type:'image'}
    ]},
    media:{title:'Edit Media',collection:'media',fields:[
        {id:'type',label:'Type (photo/video/press)',type:'text'},{id:'title',label:'Title',type:'text'},
        {id:'url',label:'URL',type:'text'},
        {id:'description',label:'Description',type:'textarea'}
    ]},
    directory:{title:'Edit Speaker/Artist',collection:'directory',fields:[
        {id:'name',label:'Full Name',type:'text'},{id:'role',label:'Role',type:'text'},
        {id:'country',label:'Country',type:'text'},{id:'genre',label:'Genre/Field',type:'text'},
        {id:'bio',label:'Biography',type:'textarea'},
        {id:'image',label:'Profile Image',type:'image'},
        {id:'videos',label:'Videos (one URL per line)',type:'textarea',multiline:true},
        {id:'music',label:'Music URLs (one per line)',type:'textarea',multiline:true}
    ]},
    heritage:{title:'Edit Heritage Resource',collection:'heritage',fields:[
        {id:'category',label:'Category',type:'text'},{id:'title',label:'Title',type:'text'},
        {id:'description',label:'Description',type:'textarea'},
        {id:'url',label:'Resource URL',type:'text'}
    ]},
    event:{title:'Edit Event',collection:'events',fields:[
        {id:'title',label:'Event Title',type:'text'},{id:'date',label:'Date',type:'datetime-local'},
        {id:'venue',label:'Venue',type:'text'},
        {id:'description',label:'Description',type:'textarea'}
    ]}
};

window.openAdminEditModal=function(type,id){
    const schema=EDIT_SCHEMAS[type];
    if(!schema){notify('Unknown edit type','error');return;}
    const item=DB.find(schema.collection,id);
    if(!item){notify('Item not found','error');return;}
    document.getElementById('adminEditModalTitle').textContent=schema.title;
    const fieldsHtml=schema.fields.map(f=>{
        let input='';
        if(f.type==='textarea'){
            let val=item[f.id];
            if(Array.isArray(val))val=val.join('\n');
            input=`<textarea id="ef_${f.id}" rows="3" placeholder="${esc(f.label)}">${esc(val||'')}</textarea>`;
        }else if(f.type==='image'){
            const img=item[f.id];
            input=`${img?`<div style="margin-bottom:8px;"><img src="${esc(img)}" style="max-width:120px; border-radius:8px; border:1px solid var(--glass-edge);"></div>`:''}<input type="file" id="ef_${f.id}" accept="image/*" style="background:transparent; border:none; padding:0;">`;
        }else{
            input=`<input type="${f.type}" id="ef_${f.id}" value="${esc(item[f.id]||'')}" required>`;
        }
        return `<div class="form-group"><label>${esc(f.label)}</label>${input}</div>`;
    }).join('');
    document.getElementById('adminEditModalBody').innerHTML=`<form id="genericEditForm"><input type="hidden" id="ef_id" value="${esc(item.id)}"><input type="hidden" id="ef_type" value="${esc(type)}">${fieldsHtml}<div class="form-row" style="display:flex; gap:10px;"><button type="submit" class="auth-btn"><i class="fas fa-save"></i> SAVE CHANGES</button><button type="button" class="auth-btn" style="background:transparent; border:1px solid var(--text-secondary);" onclick="closeAdminEditModal()">CANCEL</button></div></form>`;
    document.getElementById('genericEditForm').addEventListener('submit',handleGenericEditSubmit);
    document.getElementById('adminEditModal').style.display='flex';
};

window.closeAdminEditModal=function(){document.getElementById('adminEditModal').style.display='none';};
document.getElementById('closeAdminEditBtn')?.addEventListener('click',window.closeAdminEditModal);

async function handleGenericEditSubmit(e){
    e.preventDefault();
    const btn=e.target.querySelector('button[type="submit"]');
    await withLoading(async()=>{
        const type=document.getElementById('ef_type').value;
        const id=document.getElementById('ef_id').value;
        const schema=EDIT_SCHEMAS[type];
        const changes={};
        for(const f of schema.fields){
            if(f.type==='image'){
                const fileInput=document.getElementById('ef_'+f.id);
                if(fileInput&&fileInput.files[0]){
                    changes[f.id]=await fileToCompressedDataUrl(fileInput.files[0],600,0.75);
                }
            }else if(f.multiline){
                const val=document.getElementById('ef_'+f.id).value;
                changes[f.id]=val.split('\n').map(s=>s.trim()).filter(Boolean);
            }else if(f.type==='number'){
                changes[f.id]=parseFloat(document.getElementById('ef_'+f.id).value)||0;
            }else{
                changes[f.id]=document.getElementById('ef_'+f.id).value.trim();
            }
        }
        DB.update(schema.collection,id,changes);
        closeAdminEditModal();
        notify(schema.title+' saved','success');
        // Re-render appropriate list
        if(type==='program')renderAdminPrograms();
        else if(type==='accommodation')renderAdminAccommodation();
        else if(type==='vendor'||type==='product')renderAdminMarketplace();
        else if(type==='media')renderAdminMedia();
        else if(type==='directory')renderAdminDirectory();
        else if(type==='heritage')renderAdminHeritage();
        else if(type==='event')renderAdminEventSchedule();
    },btn,null,'Save failed');
}

/* ============================================================
   34. AUTH SUBMIT HANDLERS
   ============================================================ */
document.getElementById('registerForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=e.target.querySelector('button[type="submit"]');
    if(!selectedCategory){notify('Please choose a category first','error');window.showCategoryPicker();return;}
    await withLoading(async()=>{
        const extras={};
        ['regAttendees','regParticipantType','regArtForm','regPortfolio','regBusiness','regProductCategory','regProperty','regRooms','regGroupName','regGroupSize','regOutlet','regPressId'].forEach(id=>{const el=document.getElementById(id);if(el&&el.value)extras[id]=el.value;});
        const user=await AUTH.register({category:selectedCategory,name:document.getElementById('regName').value.trim(),email:document.getElementById('regEmail').value.trim(),phone:document.getElementById('regPhone').value.trim(),country:document.getElementById('regCountry').value.trim(),gender:document.getElementById('regGender').value,password:document.getElementById('regPassword').value,extras});
        e.target.reset();selectedCategory=null;document.getElementById('regCategoryFields').innerHTML='';
        enterApp();notify(`Welcome to PANAFEST, ${user.name}!`,'success');
    },btn,null,'Registration failed');
});

document.getElementById('loginForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const btn=e.target.querySelector('button[type="submit"]');
    await withLoading(async()=>{
        const user=await AUTH.login(document.getElementById('loginEmail').value.trim(),document.getElementById('loginPassword').value);
        e.target.reset();enterApp();notify(`Welcome back, ${user.name}!`,'success');
    },btn,null,'Login failed');
});

document.getElementById('adminLoginForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const btn=e.target.querySelector('button[type="submit"]');
    await withLoading(async()=>{
        const admin=await AUTH.adminLogin(document.getElementById('adminLoginEmail').value.trim(),document.getElementById('adminLoginPassword').value);
        e.target.reset();enterApp();notify(`Admin session started — ${admin.name}`,'success');
    },btn,null,'Admin login failed');
});

document.getElementById('forgotPasswordLink')?.addEventListener('click',e=>{
    e.preventDefault();
    const email=prompt('Enter your registered email:');
    if(!email)return;
    const user=DB.users.find(u=>(u.email||'').toLowerCase()===email.toLowerCase().trim());
    if(!user){notify('No account with this email.','error');return;}
    const newPwd=prompt('Enter a new password (min 6 chars):');
    if(!newPwd||newPwd.length<6){notify('Password too short.','error');return;}
    DB.update('users',user.id,{password:newPwd});
    notify('Password reset successfully.','success');
});

/* ============================================================
   35. ENTER APP / LOGOUT / THEME
   ============================================================ */
function enterApp(){
    document.getElementById('authModal').style.display='none';
    document.getElementById('appContent').style.display='block';
    const p=AUTH.profile;
    const roleLabel=p?.role==='admin'?'ADMIN':(p?.category||'CUSTOMER').toUpperCase();
    document.getElementById('currentUser').textContent=p?.name||'User';
    const roleEl=document.getElementById('userRole');
    roleEl.textContent=roleLabel;roleEl.setAttribute('data-role',p?.role||'customer');
    document.getElementById('drawerUserName').textContent=p?.name||'User';
    document.getElementById('drawerUserRole').textContent=roleLabel;
    const banner=document.getElementById('slidingBannerContainer');
    if(p?.role==='admin'){banner.style.display='none';document.body.classList.remove('student-view');}
    else{banner.style.display='block';document.body.classList.add('student-view');startBannerRotation();}
    renderMenuGrid();showMenuPage();
}

function logout(){
    AUTH.logout();
    document.getElementById('appContent').style.display='none';
    document.getElementById('authModal').style.display='flex';
    window.showLoginForm();
    document.body.classList.remove('student-view','module-open');
    document.getElementById('detailPageContainer').style.display='none';
    if(bannerInterval){clearInterval(bannerInterval);bannerInterval=null;}
}
document.getElementById('logoutBtn')?.addEventListener('click',logout);
document.getElementById('drawerLogoutBtn')?.addEventListener('click',()=>{document.getElementById('menuDrawer').classList.remove('open');logout();});

let darkMode=true;
if(localStorage.getItem('panafest_theme')==='light'){darkMode=false;document.body.classList.add('light-mode');}
function toggleTheme(){darkMode=!darkMode;document.body.classList.toggle('light-mode',!darkMode);localStorage.setItem('panafest_theme',darkMode?'dark':'light');}
document.getElementById('toggleDarkModeBtn')?.addEventListener('click',toggleTheme);
document.getElementById('drawerDarkModeBtn')?.addEventListener('click',()=>{toggleTheme();document.getElementById('menuDrawer').classList.remove('open');});

/* ============================================================
   36. BANNER + DRAWER
   ============================================================ */
let bannerInterval=null;
function startBannerRotation(){
    if(bannerInterval)clearInterval(bannerInterval);
    const slides=document.querySelectorAll('.slide');const wrapper=document.querySelector('.sliding-banner');
    if(!slides.length||!wrapper)return;
    let idx=0;
    // FIX (2027): translateX percentage is relative to the wrapper's own width (100% * slides.length).
    // Previously used idx*100 which skipped past ALL slides on the first tick.
    // Correct step per slide = 100 / slides.length.
    const stepPct = 100 / slides.length;
    wrapper.style.transform = 'translateX(0%)';
    bannerInterval=setInterval(()=>{
        idx=(idx+1)%slides.length;
        wrapper.style.transform=`translateX(-${idx*stepPct}%)`;
    },4500);
}
document.getElementById('menuDrawerBtn')?.addEventListener('click',()=>{document.getElementById('menuDrawer').classList.add('open');});
document.getElementById('closeDrawerBtn')?.addEventListener('click',()=>{document.getElementById('menuDrawer').classList.remove('open');});
document.getElementById('backToMenuBtn')?.addEventListener('click',showMenuPage);

/* ============================================================
   37. BOOT
   ============================================================ */
function boot(){
    if(AUTH.restore()){enterApp();}else{document.getElementById('authModal').style.display='flex';window.showLoginForm();}
    renderCategoryIcons();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();

window.AUTH=AUTH;
window.DB=DB;
/* ============================================================
   DIASPORA CONNECTION HUB — Complete Enhancement (2027)
   ============================================================ */

/* -------- 1. EXTEND DB COLLECTIONS -------- */
// Add new collections to DB._keys and initialize
(function extendDiasporaDB(){
    const newKeys = [
        'diasporaProfiles','diasporaConnections','diasporaBlocks',
        'diasporaChapters','diasporaChapterMembers',
        'diasporaCommunities','diasporaCommunityMembers',
        'diasporaForumPosts','diasporaForumReplies',
        'diasporaConversations','diasporaStories',
        'diasporaBusinessListings','diasporaNotifications','diasporaReports'
    ];
    newKeys.forEach(k=>{
        if(!DB._keys.includes(k)){
            DB._keys.push(k);
            if(!Array.isArray(DB[k])) DB[k]=[];
            try{const r=localStorage.getItem('panafest_'+k);if(r)DB[k]=JSON.parse(r);}catch{}
        }
    });
    DB.save = DB.save.bind(DB);
    window.DB = DB;
})();

/* -------- 2. SEED DIASPORA DATA -------- */
function seedDiasporaHub(){
    const VERSION = 'hub-v1';
    if(localStorage.getItem('panafest_hub_seed')===VERSION) return;
    localStorage.setItem('panafest_hub_seed',VERSION);

    // Chapters (expanded)
    if(DB.diasporaChapters.length===0){
        [
            {name:'Ghana Chapter',country:'Ghana',description:'The home chapter — connecting Ghanaians and returnees across the motherland.',banner:placeholderImage('Ghana','#FFD700','#B8860B')},
            {name:'USA Chapter',country:'USA',description:'Uniting African descendants across the United States.',banner:placeholderImage('USA','#3b82f6','#1d4ed8')},
            {name:'UK Chapter',country:'United Kingdom',description:'PANAFEST community in the United Kingdom.',banner:placeholderImage('UK','#b96bff','#8844cc')},
            {name:'Canada Chapter',country:'Canada',description:'Diaspora community across Canada.',banner:placeholderImage('Canada','#ef4444','#b91c1c')},
            {name:'Jamaica Chapter',country:'Jamaica',description:'Caribbean connection — Jamaica to Africa.',banner:placeholderImage('Jamaica','#4ade80','#16a34a')},
            {name:'Brazil Chapter',country:'Brazil',description:'Afro-Brazilian participants and supporters of PANAFEST.',banner:placeholderImage('Brazil','#22c55e','#15803d')},
            {name:'Nigeria Chapter',country:'Nigeria',description:'Connecting Nigerians in PANAFEST fellowship.',banner:placeholderImage('Nigeria','#ffbb4a','#cc8800')},
            {name:'South Africa Chapter',country:'South Africa',description:'Southern African representation at PANAFEST.',banner:placeholderImage('South Africa','#ff4d9a','#cc3377')},
            {name:'Trinidad & Tobago Chapter',country:'Trinidad and Tobago',description:'Trinidadian and Tobagonian heritage community.',banner:placeholderImage('Trinidad','#FFD700','#8a6510')},
            {name:'Barbados Chapter',country:'Barbados',description:'Bajan heritage network for PANAFEST.',banner:placeholderImage('Barbados','#3b82f6','#1e40af')}
        ].forEach(c=>DB.add('diasporaChapters',{...c,createdAt:new Date().toISOString()}));
    }

    // Communities (interest groups)
    if(DB.diasporaCommunities.length===0){
        [
            {name:'African History',icon:'fa-book',category:'History',description:'Discuss, learn, and share African history — from ancient kingdoms to modern movements.'},
            {name:'Heritage Tourism',icon:'fa-map',category:'Tourism',description:'Explore heritage sites, castles, and cultural landmarks with fellow travelers.'},
            {name:'African Business Network',icon:'fa-briefcase',category:'Business',description:'Connect entrepreneurs, investors, and business minds across Africa and the diaspora.'},
            {name:'Invest In Africa',icon:'fa-chart-line',category:'Investment',description:'Discover investment opportunities on the continent.'},
            {name:'Young African Leaders',icon:'fa-users',category:'Youth',description:'Empowering the next generation of African leaders.'},
            {name:'Women Empowerment',icon:'fa-venus',category:'Empowerment',description:'Celebrating and supporting African women in leadership.'},
            {name:'African Arts & Culture',icon:'fa-palette',category:'Arts',description:'Celebrate the vibrant arts of Africa.'},
            {name:'African Music Network',icon:'fa-music',category:'Music',description:'For musicians, producers, and music lovers.'},
            {name:'PANAFEST Volunteers',icon:'fa-hands-helping',category:'Volunteers',description:'Organize and volunteer for PANAFEST events.'},
            {name:'Diaspora Homecoming',icon:'fa-plane-arrival',category:'Homecoming',description:'Stories and tips for returning to Africa.'}
        ].forEach(c=>DB.add('diasporaCommunities',{...c,createdAt:new Date().toISOString()}));
    }

    // Forum seed posts
    if(DB.diasporaForumPosts.length===0){
        const seedAuthor = DB.users.find(u=>u.role!=='admin');
        [
            {category:'History & Heritage',title:'What does PANAFEST mean to you personally?',content:'For me, PANAFEST is more than an event — it\'s a homecoming. I grew up hearing stories of Ghana from my grandmother, and finally walking through Cape Coast Castle moved me to tears. What does PANAFEST mean to you?'},
            {category:'Diaspora Stories',title:'My first time in Ghana — a homecoming I\'ll never forget',content:'I arrived in Accra not knowing what to expect. Within a week, I was standing in Elmina Castle, hearing the ocean against the walls. The weight of history met the warmth of the people. I cried, laughed, and came home with a new understanding of who I am.'},
            {category:'Business Opportunities',title:'Looking for partners for an agribusiness venture in Ghana',content:'I\'m a Ghanaian-American entrepreneur exploring a cocoa-export venture. Interested in connecting with partners on the ground — growers, processors, or logistics. Reply or message me directly.'},
            {category:'Pan-Africanism',title:'How do we make Pan-Africanism real in 2027?',content:'Pan-Africanism has never been more important. But slogans aren\'t enough — what concrete steps can we take as a community to build real unity between the continent and the diaspora?'},
            {category:'Art & Culture',title:'Kente, Adinkra, and the stories they carry',content:'Every symbol has meaning. Every color has heritage. What do the Adinkra symbols mean in your family? Share your knowledge and photos!'}
        ].forEach(p=>DB.add('diasporaForumPosts',{
            ...p,authorId:seedAuthor?.id||'seed',authorName:seedAuthor?.name||'PANAFEST Pioneer',
            likes:[],createdAt:new Date(Date.now()-Math.random()*7*86400000).toISOString(),updatedAt:new Date().toISOString()
        }));
    }

    // Stories seed
    if(DB.diasporaStories.length===0){
        const seedAuthor = DB.users.find(u=>u.role!=='admin');
        [
            {title:'My Grandmother\'s Journey — From Elmina to Bahia',category:'Family History',content:'My grandmother spoke of the ocean as if it were a person. It carried her ancestors away and now carries us back. When I stepped off the plane in Accra, I felt the ancestors smiling. This is my story of returning.',featured:true},
            {title:'The Door of No Return — Standing in the Silence',category:'Homecoming',content:'They call it the Door of No Return. But standing there, I realized we returned. We came back. We reclaimed that door. That realization changed everything for me.',featured:true},
            {title:'Cultural Traditions Passed Down Through Generations',category:'Cultural Traditions',content:'Every festival, every dance, every song — these are memories we carry in our bones. In Trinidad, we celebrate. In Nigeria, we celebrate. In Ghana, we celebrate. It is all the same spirit.'}
        ].forEach(s=>DB.add('diasporaStories',{
            ...s,authorId:seedAuthor?.id||'seed',authorName:seedAuthor?.name||'PANAFEST Storyteller',
            likes:[],createdAt:new Date(Date.now()-Math.random()*10*86400000).toISOString()
        }));
    }

    // Business listings seed
    if(DB.diasporaBusinessListings.length===0){
        const seedAuthor = DB.users.find(u=>u.role!=='admin');
        [
            {type:'offering',category:'Investment',title:'Investment opportunities in Ghanaian agribusiness',description:'Looking for diaspora partners to invest in sustainable cocoa export. Returns projected 15-20% annually.',contact:'+' + '233241234567'},
            {type:'seeking',category:'Partnership',title:'Seeking tourism partners for heritage tours',description:'Developing premium heritage tours between Ghana and the US. Seeking local operators for partnership.',contact:'+' + '233241234567'},
            {type:'offering',category:'Professional Services',title:'Marketing & brand strategy consulting',description:'Helping African businesses reach global audiences. 10+ years experience in brand strategy.'}
        ].forEach(b=>DB.add('diasporaBusinessListings',{
            ...b,userId:seedAuthor?.id||'seed',userName:seedAuthor?.name||'PANAFEST Entrepreneur',
            createdAt:new Date(Date.now()-Math.random()*14*86400000).toISOString()
        }));
    }

    // Seed sample connections between test users (if any)
    const customers = DB.users.filter(u=>u.role!=='admin');
    if(customers.length>=2 && DB.diasporaConnections.length===0){
        DB.add('diasporaConnections',{
            fromUserId:customers[0].id,toUserId:customers[1].id,
            status:'accepted',createdAt:new Date().toISOString(),acceptedAt:new Date().toISOString()
        });
    }
}
seedDiasporaHub();

/* -------- 3. HELPER FUNCTIONS -------- */
function hubGetProfile(userId){
    if(!userId) return null;
    let p = DB.diasporaProfiles.find(x=>x.userId===userId);
    if(!p){
        const user = DB.find('users',userId);
        if(!user) return null;
        p = {
            userId, coverPhoto:null,
            dob:'', city:user.city||'', languages:'',
            occupation:'', organization:'', industry:'',
            skills:[], website:'', linkedin:'',
            interests:[], programs:[], heritageInterests:[],
            aboutMe:'', heritageJourney:'', culturalBackground:'',
            verified:false, completion:20
        };
        DB.add('diasporaProfiles',p);
    }
    return p;
}

function hubCalcCompletion(p){
    if(!p) return 0;
    const fields = [
        p.dob, p.city, p.languages, p.occupation, p.organization, p.industry,
        p.skills?.length>0, p.website||p.linkedin, p.interests?.length>0,
        p.aboutMe, p.heritageJourney, p.culturalBackground, p.coverPhoto
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
}

function hubGetUser(userId){ return DB.find('users',userId); }
function hubUserDisplayName(userId){
    const u = hubGetUser(userId);
    return u ? u.name : 'Unknown';
}
function hubUserPic(userId){
    const u = hubGetUser(userId);
    return u?.picture || placeholderImage((u?.name||'User').slice(0,1), '#FFD700', '#B8860B');
}
function hubUserCountry(userId){
    const u = hubGetUser(userId);
    return u?.country || '';
}

function hubConnectionStatus(userA, userB){
    const c = DB.diasporaConnections.find(x=>
        (x.fromUserId===userA && x.toUserId===userB) ||
        (x.fromUserId===userB && x.toUserId===userA)
    );
    if(!c) return 'none';
    return c.status;
}

function hubIsFollowing(followerId, followingId){
    return DB.diasporaFollows.some(f=>f.followerId===followerId && f.followingId===followingId);
}

function hubNotifyUser(userId, type, title, message){
    if(!userId) return;
    DB.add('diasporaNotifications',{
        userId, type, title, message, read:false,
        createdAt: new Date().toISOString()
    });
}

function hubUnreadNotifs(userId){
    return DB.diasporaNotifications.filter(n=>n.userId===userId && !n.read).length;
}

function hubUnreadMessages(userId){
    let count = 0;
    DB.diasporaMessages.forEach(m=>{
        if(m.toUserId===userId && !(m.readBy||[]).includes(userId)) count++;
    });
    return count;
}

function hubUpdateBadges(){
    if(!AUTH.current) return;
    const n = hubUnreadNotifs(AUTH.current.id);
    const m = hubUnreadMessages(AUTH.current.id);
    const nBadge = document.getElementById('hubNotifBadge');
    const mBadge = document.getElementById('hubMsgBadge');
    if(nBadge){ nBadge.textContent = n>99?'99+':n; nBadge.style.display = n>0?'inline-flex':'none'; }
    if(mBadge){ mBadge.textContent = m>99?'99+':m; mBadge.style.display = m>0?'inline-flex':'none'; }
}

/* -------- 4. CUSTOMER: DIASPORA HUB ROOT -------- */
let currentHubTab = 'dashboard';
let currentAdminHubTab = 'members';

function initDiaspora(){
    document.querySelectorAll('#hubTabs .hub-tab').forEach(btn=>{
        btn.onclick = ()=>switchHubTab(btn.dataset.hubTab);
    });
    switchHubTab('dashboard');
    hubUpdateBadges();
}

function switchHubTab(tab){
    currentHubTab = tab;
    document.querySelectorAll('#hubTabs .hub-tab').forEach(b=>b.classList.toggle('active-hub-tab',b.dataset.hubTab===tab));
    const wrap = document.getElementById('hubContent');
    if(!wrap) return;

    switch(tab){
        case 'dashboard': renderHubDashboard(wrap); break;
        case 'profile': renderHubProfile(wrap); break;
        case 'members': renderHubMembers(wrap); break;
        case 'connections': renderHubConnections(wrap); break;
        case 'chapters': renderHubChapters(wrap); break;
        case 'communities': renderHubCommunities(wrap); break;
        case 'forum': renderHubForum(wrap); break;
        case 'messages': renderHubMessages(wrap); break;
        case 'stories': renderHubStories(wrap); break;
        case 'business': renderHubBusiness(wrap); break;
        case 'notifications': renderHubNotifications(wrap); break;
    }
    hubUpdateBadges();
}

/* -------- 5. DASHBOARD TAB -------- */
function renderHubDashboard(wrap){
    const userId = AUTH.current.id;
    const profile = hubGetProfile(userId);
    profile.completion = hubCalcCompletion(profile);
    DB.update('diasporaProfiles',profile.id,{completion:profile.completion});

    const myConns = DB.diasporaConnections.filter(c=>(c.fromUserId===userId||c.toUserId===userId)&&c.status==='accepted');
    const pendingReqs = DB.diasporaConnections.filter(c=>c.toUserId===userId&&c.status==='pending');
    const myChapters = DB.diasporaChapterMembers.filter(m=>m.userId===userId);
    const myCommunities = DB.diasporaCommunityMembers.filter(m=>m.userId===userId);
    const unreadMsgs = hubUnreadMessages(userId);
    const unreadNotifs = hubUnreadNotifs(userId);

    // Suggested connections: users not connected with
    const allUsers = DB.users.filter(u=>u.role!=='admin'&&u.id!==userId);
    const suggestions = allUsers.filter(u=>hubConnectionStatus(userId,u.id)==='none').slice(0,3);

    const upcomingEvents = DB.events.filter(e=>new Date(e.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,3);
    const recentPosts = [...DB.diasporaForumPosts].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,3);
    const recentBiz = [...DB.diasporaBusinessListings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,2);

    wrap.innerHTML = `
        <div class="hub-stats-grid">
            <div class="hub-stat-card" onclick="switchHubTab('profile')"><i class="fas fa-user-circle"></i><div class="hub-stat-value">${profile.completion}%</div><div class="hub-stat-label">Profile</div></div>
            <div class="hub-stat-card" onclick="switchHubTab('connections')"><i class="fas fa-handshake"></i><div class="hub-stat-value">${myConns.length}</div><div class="hub-stat-label">Connections</div></div>
            <div class="hub-stat-card" onclick="switchHubTab('chapters')"><i class="fas fa-globe"></i><div class="hub-stat-value">${myChapters.length}</div><div class="hub-stat-label">Chapters</div></div>
            <div class="hub-stat-card" onclick="switchHubTab('communities')"><i class="fas fa-lightbulb"></i><div class="hub-stat-value">${myCommunities.length}</div><div class="hub-stat-label">Communities</div></div>
            <div class="hub-stat-card" onclick="switchHubTab('messages')"><i class="fas fa-envelope"></i><div class="hub-stat-value">${unreadMsgs}</div><div class="hub-stat-label">Unread Msgs</div></div>
            <div class="hub-stat-card" onclick="switchHubTab('notifications')"><i class="fas fa-bell"></i><div class="hub-stat-value">${unreadNotifs}</div><div class="hub-stat-label">Alerts</div></div>
        </div>

        ${pendingReqs.length?`
            <h3 class="hub-section-title"><i class="fas fa-user-plus"></i> Connection Requests (${pendingReqs.length})</h3>
            ${pendingReqs.slice(0,3).map(c=>{
                const u = hubGetUser(c.fromUserId);
                if(!u) return '';
                return `<div class="hub-req-row">
                    <div class="hub-member-avatar"><img src="${hubUserPic(u.id)}"></div>
                    <div class="hub-member-info"><div class="hub-member-name">${esc(u.name)}</div><div class="hub-member-role">${esc(u.country||'')} · ${esc(u.category||'')}</div></div>
                    <button class="hub-action-btn primary" onclick="hubAcceptConnection('${c.id}')">Accept</button>
                    <button class="hub-action-btn danger" onclick="hubRejectConnection('${c.id}')">Decline</button>
                </div>`;
            }).join('')}
        `:''}

        <h3 class="hub-section-title"><i class="fas fa-user-plus"></i> People You May Know</h3>
        ${suggestions.length?suggestions.map(u=>renderMemberMiniCard(u,userId)).join(''):'<p class="muted" style="padding:12px;">No suggestions yet.</p>'}

        <h3 class="hub-section-title"><i class="fas fa-calendar"></i> Upcoming PANAFEST Events</h3>
        ${upcomingEvents.length?upcomingEvents.map(e=>`<div class="hub-biz-card"><div class="hub-biz-title">${esc(e.title)}</div><div class="hub-biz-desc">${new Date(e.date).toLocaleString()} · ${esc(e.venue||'')}</div></div>`).join(''):'<p class="muted" style="padding:12px;">No upcoming events.</p>'}

        <h3 class="hub-section-title"><i class="fas fa-comments"></i> Recent Discussions</h3>
        ${recentPosts.length?recentPosts.map(p=>`<div class="hub-forum-post" onclick="switchHubTab('forum')"><div class="hub-forum-title">${esc(p.title)}</div><div class="hub-story-meta">${esc(p.authorName)} · ${esc(p.category)} · ${new Date(p.createdAt).toLocaleDateString()}</div></div>`).join(''):'<p class="muted" style="padding:12px;">No discussions yet.</p>'}

        <h3 class="hub-section-title"><i class="fas fa-briefcase"></i> Business Opportunities</h3>
        ${recentBiz.length?recentBiz.map(b=>`<div class="hub-biz-card"><span class="hub-biz-type ${b.type}">${b.type.toUpperCase()}</span><div class="hub-biz-title">${esc(b.title)}</div><div class="hub-biz-desc">${esc(b.description)}</div></div>`).join(''):'<p class="muted" style="padding:12px;">No business listings yet.</p>'}
    `;
}

function renderMemberMiniCard(u, currentUserId){
    const status = hubConnectionStatus(currentUserId,u.id);
    const following = hubIsFollowing(currentUserId,u.id);
    let connectBtn = '';
    if(status==='none') connectBtn = `<button class="hub-action-btn primary" onclick="hubSendConnectionRequest('${u.id}')"><i class="fas fa-user-plus"></i> Connect</button>`;
    else if(status==='pending') connectBtn = `<button class="hub-action-btn" disabled>Pending</button>`;
    else if(status==='accepted') connectBtn = `<button class="hub-action-btn success"><i class="fas fa-check"></i> Connected</button>`;

    return `<div class="hub-member-card">
        <div class="hub-member-avatar"><img src="${hubUserPic(u.id)}"></div>
        <div class="hub-member-info">
            <div class="hub-member-name">${esc(u.name)}</div>
            <div class="hub-member-role">${esc(u.country||'')} · ${esc(u.category||'')}</div>
        </div>
        <div class="hub-member-actions">
            ${connectBtn}
            <button class="hub-action-btn ${following?'success':''}" onclick="hubToggleFollow('${u.id}')"><i class="fas fa-${following?'check':'plus'}"></i> ${following?'Following':'Follow'}</button>
            <button class="hub-action-btn" onclick="hubStartConversation('${u.id}')"><i class="fas fa-envelope"></i></button>
        </div>
    </div>`;
}

/* -------- 6. PROFILE TAB -------- */
function renderHubProfile(wrap){
    const userId = AUTH.current.id;
    const profile = hubGetProfile(userId);
    const user = hubGetUser(userId);
    profile.completion = hubCalcCompletion(profile);
    DB.update('diasporaProfiles',profile.id,{completion:profile.completion});

    wrap.innerHTML = `
        <div class="hub-profile-card">
            <div class="hub-cover">${profile.coverPhoto?`<img src="${esc(profile.coverPhoto)}">`:''}</div>
            <div class="hub-profile-body">
                <div class="hub-avatar">${user?.picture?`<img src="${esc(user.picture)}">`:`<i class="fas fa-user"></i>`}</div>
                <div class="hub-profile-name">${esc(user?.name||'')} ${profile.verified?'<span class="hub-verified"><i class="fas fa-check-circle"></i> Verified</span>':''}</div>
                <div class="hub-profile-meta">
                    ${user?.country?`<span><i class="fas fa-globe"></i> ${esc(user.country)}</span>`:''}
                    ${user?.category?`<span><i class="fas fa-tag"></i> ${esc(user.category)}</span>`:''}
                </div>
                <div class="hub-completion">
                    Profile Completion: <strong>${profile.completion}%</strong>
                    <div class="hub-completion-bar"><div class="hub-completion-fill" style="width:${profile.completion}%;"></div></div>
                </div>
                <div class="hub-member-actions" style="margin-top:12px;">
                    <button class="hub-action-btn primary" onclick="hubEditProfile()"><i class="fas fa-edit"></i> Edit Profile</button>
                </div>
            </div>
        </div>

        <h3 class="hub-section-title"><i class="fas fa-user"></i> Personal Information</h3>
        <div class="profile-card">
            <div class="profile-row"><span>Date of Birth</span><span>${esc(profile.dob||'—')}</span></div>
            <div class="profile-row"><span>City</span><span>${esc(profile.city||'—')}</span></div>
            <div class="profile-row"><span>Languages</span><span>${esc(profile.languages||'—')}</span></div>
        </div>

        <h3 class="hub-section-title"><i class="fas fa-briefcase"></i> Professional Information</h3>
        <div class="profile-card">
            <div class="profile-row"><span>Occupation</span><span>${esc(profile.occupation||'—')}</span></div>
            <div class="profile-row"><span>Organization</span><span>${esc(profile.organization||'—')}</span></div>
            <div class="profile-row"><span>Industry</span><span>${esc(profile.industry||'—')}</span></div>
            <div class="profile-row"><span>Skills</span><span>${(profile.skills||[]).join(', ')||'—'}</span></div>
            ${profile.website?`<div class="profile-row"><span>Website</span><span><a href="${esc(profile.website)}" target="_blank" style="color:var(--gold-primary);">${esc(profile.website)}</a></span></div>`:''}
            ${profile.linkedin?`<div class="profile-row"><span>LinkedIn</span><span><a href="${esc(profile.linkedin)}" target="_blank" style="color:var(--gold-primary);">${esc(profile.linkedin)}</a></span></div>`:''}
        </div>

        <h3 class="hub-section-title"><i class="fas fa-heart"></i> About Me</h3>
        <div class="profile-card">
            <div class="profile-row" style="flex-direction:column; align-items:flex-start; gap:6px;"><span>ABOUT</span><span style="text-align:left;">${esc(profile.aboutMe||'Not yet provided.')}</span></div>
            <div class="profile-row" style="flex-direction:column; align-items:flex-start; gap:6px;"><span>MY HERITAGE JOURNEY</span><span style="text-align:left;">${esc(profile.heritageJourney||'Not yet provided.')}</span></div>
            <div class="profile-row" style="flex-direction:column; align-items:flex-start; gap:6px;"><span>CULTURAL BACKGROUND</span><span style="text-align:left;">${esc(profile.culturalBackground||'Not yet provided.')}</span></div>
        </div>
    `;
}

window.hubEditProfile = function(){
    const userId = AUTH.current.id;
    const profile = hubGetProfile(userId);
    const user = hubGetUser(userId);

    const wrap = document.getElementById('hubContent');
    wrap.innerHTML = `
        <h3 class="hub-section-title"><i class="fas fa-edit"></i> Edit Profile</h3>
        <form id="hubEditProfileForm" class="admin-form">
            <h4 style="color:var(--gold-primary); margin-bottom:10px;">Personal</h4>
            <div class="form-row two-col">
                <div class="form-group"><label>Date of Birth</label><input type="date" id="hpDob" value="${esc(profile.dob||'')}"></div>
                <div class="form-group"><label>City</label><input type="text" id="hpCity" value="${esc(profile.city||'')}"></div>
            </div>
            <div class="form-group"><label>Languages Spoken</label><input type="text" id="hpLanguages" placeholder="e.g., English, Twi, French" value="${esc(profile.languages||'')}"></div>

            <h4 style="color:var(--gold-primary); margin:14px 0 10px;">Professional</h4>
            <div class="form-row two-col">
                <div class="form-group"><label>Occupation</label><input type="text" id="hpOccupation" value="${esc(profile.occupation||'')}"></div>
                <div class="form-group"><label>Organization</label><input type="text" id="hpOrganization" value="${esc(profile.organization||'')}"></div>
            </div>
            <div class="form-row two-col">
                <div class="form-group"><label>Industry</label><input type="text" id="hpIndustry" value="${esc(profile.industry||'')}"></div>
                <div class="form-group"><label>Skills (comma-separated)</label><input type="text" id="hpSkills" value="${esc((profile.skills||[]).join(', '))}"></div>
            </div>
            <div class="form-row two-col">
                <div class="form-group"><label>Website</label><input type="url" id="hpWebsite" value="${esc(profile.website||'')}"></div>
                <div class="form-group"><label>LinkedIn</label><input type="url" id="hpLinkedin" value="${esc(profile.linkedin||'')}"></div>
            </div>

            <h4 style="color:var(--gold-primary); margin:14px 0 10px;">Biography</h4>
            <div class="form-group"><label>About Me</label><textarea id="hpAboutMe" rows="3">${esc(profile.aboutMe||'')}</textarea></div>
            <div class="form-group"><label>My Heritage Journey</label><textarea id="hpHeritageJourney" rows="3">${esc(profile.heritageJourney||'')}</textarea></div>
            <div class="form-group"><label>Cultural Background</label><textarea id="hpCulturalBackground" rows="3">${esc(profile.culturalBackground||'')}</textarea></div>

            <div class="form-row" style="display:flex; gap:10px;">
                <button type="submit" class="auth-btn">SAVE PROFILE</button>
                <button type="button" class="auth-btn" style="background:transparent; border:1px solid var(--text-secondary);" onclick="switchHubTab('profile')">CANCEL</button>
            </div>
        </form>
    `;

    document.getElementById('hubEditProfileForm').addEventListener('submit',e=>{
        e.preventDefault();
        const changes = {
            dob: document.getElementById('hpDob').value,
            city: document.getElementById('hpCity').value.trim(),
            languages: document.getElementById('hpLanguages').value.trim(),
            occupation: document.getElementById('hpOccupation').value.trim(),
            organization: document.getElementById('hpOrganization').value.trim(),
            industry: document.getElementById('hpIndustry').value.trim(),
            skills: document.getElementById('hpSkills').value.split(',').map(s=>s.trim()).filter(Boolean),
            website: document.getElementById('hpWebsite').value.trim(),
            linkedin: document.getElementById('hpLinkedin').value.trim(),
            aboutMe: document.getElementById('hpAboutMe').value.trim(),
            heritageJourney: document.getElementById('hpHeritageJourney').value.trim(),
            culturalBackground: document.getElementById('hpCulturalBackground').value.trim()
        };
        changes.completion = hubCalcCompletion({...profile,...changes});
        DB.update('diasporaProfiles',profile.id,changes);
        notify('Profile updated!','success');
        switchHubTab('profile');
    });
};

/* -------- 7. MEMBERS DIRECTORY -------- */
let hubMembersFilter = {country:'all',category:'all',search:''};

function renderHubMembers(wrap){
    const userId = AUTH.current.id;
    let members = DB.users.filter(u=>u.role!=='admin'&&u.id!==userId);
    const allCountries = [...new Set(members.map(m=>m.country).filter(Boolean))].sort();
    const allCategories = [...new Set(members.map(m=>m.category).filter(Boolean))].sort();

    wrap.innerHTML = `
        <div class="search-box" style="margin-bottom:12px;">
            <i class="fas fa-search"></i><input type="text" id="hubMemberSearch" placeholder="Search name, profession, skills..." value="${esc(hubMembersFilter.search)}"><button id="hubMemberSearchBtn"><i class="fas fa-radar"></i> FIND</button>
        </div>
        <div class="mp-filter-bar" style="margin-bottom:16px;">
            <select id="hubFilterCountry" class="mp-select">
                <option value="all">All Countries</option>
                ${allCountries.map(c=>`<option value="${esc(c)}" ${hubMembersFilter.country===c?'selected':''}>${esc(c)}</option>`).join('')}
            </select>
            <select id="hubFilterCategory" class="mp-select">
                <option value="all">All Categories</option>
                ${allCategories.map(c=>`<option value="${esc(c)}" ${hubMembersFilter.category===c?'selected':''}>${esc(c)}</option>`).join('')}
            </select>
        </div>
        <div id="hubMembersList"></div>
    `;

    document.getElementById('hubMemberSearchBtn').onclick = ()=>{ hubMembersFilter.search = document.getElementById('hubMemberSearch').value; renderHubMembers(wrap); };
    document.getElementById('hubMemberSearch').onkeyup = (e)=>{ if(e.key==='Enter'){ hubMembersFilter.search = e.target.value; renderHubMembers(wrap); } };
    document.getElementById('hubFilterCountry').onchange = (e)=>{ hubMembersFilter.country = e.target.value; renderHubMembers(wrap); };
    document.getElementById('hubFilterCategory').onchange = (e)=>{ hubMembersFilter.category = e.target.value; renderHubMembers(wrap); };

    if(hubMembersFilter.country!=='all') members = members.filter(m=>m.country===hubMembersFilter.country);
    if(hubMembersFilter.category!=='all') members = members.filter(m=>m.category===hubMembersFilter.category);
    if(hubMembersFilter.search){
        const q = hubMembersFilter.search.toLowerCase();
        members = members.filter(m=>{
            const p = hubGetProfile(m.id);
            return (m.name||'').toLowerCase().includes(q) ||
                (p?.occupation||'').toLowerCase().includes(q) ||
                (p?.organization||'').toLowerCase().includes(q) ||
                (p?.industry||'').toLowerCase().includes(q) ||
                (p?.skills||[]).join(' ').toLowerCase().includes(q) ||
                (p?.aboutMe||'').toLowerCase().includes(q);
        });
    }

    const list = document.getElementById('hubMembersList');
    if(!members.length){ list.innerHTML = '<div class="hub-empty"><i class="fas fa-users"></i><p>No members match your filters.</p></div>'; return; }
    list.innerHTML = members.map(m=>{
        const p = hubGetProfile(m.id);
        const status = hubConnectionStatus(userId,m.id);
        const following = hubIsFollowing(userId,m.id);
        let btn = '';
        if(status==='none') btn = `<button class="hub-action-btn primary" onclick="hubSendConnectionRequest('${m.id}')"><i class="fas fa-user-plus"></i> Connect</button>`;
        else if(status==='pending') btn = `<button class="hub-action-btn" disabled>Pending</button>`;
        else if(status==='accepted') btn = `<button class="hub-action-btn success"><i class="fas fa-check"></i> Connected</button>`;

        return `<div class="hub-member-card">
            <div class="hub-member-avatar"><img src="${hubUserPic(m.id)}"></div>
            <div class="hub-member-info">
                <div class="hub-member-name">${esc(m.name)} ${p?.verified?'<span class="hub-verified"><i class="fas fa-check-circle"></i></span>':''}</div>
                <div class="hub-member-role">${esc(m.country||'')} · ${esc(m.category||'')}${p?.occupation?' · '+esc(p.occupation):''}</div>
                ${p?.skills?.length?`<div class="hub-member-tags">${p.skills.slice(0,3).map(s=>`<span class="tag">${esc(s)}</span>`).join('')}</div>`:''}
            </div>
            <div class="hub-member-actions">
                ${btn}
                <button class="hub-action-btn ${following?'success':''}" onclick="hubToggleFollow('${m.id}')"><i class="fas fa-${following?'check':'plus'}"></i> ${following?'Following':'Follow'}</button>
                <button class="hub-action-btn" onclick="hubStartConversation('${m.id}')"><i class="fas fa-envelope"></i></button>
            </div>
        </div>`;
    }).join('');
}

/* -------- 8. CONNECTIONS TAB -------- */
function renderHubConnections(wrap){
    const userId = AUTH.current.id;
    const myConns = DB.diasporaConnections.filter(c=>(c.fromUserId===userId||c.toUserId===userId)&&c.status==='accepted');
    const pending = DB.diasporaConnections.filter(c=>c.toUserId===userId&&c.status==='pending');
    const sent = DB.diasporaConnections.filter(c=>c.fromUserId===userId&&c.status==='pending');

    wrap.innerHTML = `
        <h3 class="hub-section-title"><i class="fas fa-clock"></i> Pending Requests (${pending.length})</h3>
        ${pending.length?pending.map(c=>{
            const u = hubGetUser(c.fromUserId);
            if(!u) return '';
            return `<div class="hub-req-row">
                <div class="hub-member-avatar"><img src="${hubUserPic(u.id)}"></div>
                <div class="hub-member-info"><div class="hub-member-name">${esc(u.name)}</div><div class="hub-member-role">${esc(u.country||'')} · ${esc(u.category||'')}</div></div>
                <button class="hub-action-btn primary" onclick="hubAcceptConnection('${c.id}')"><i class="fas fa-check"></i> Accept</button>
                <button class="hub-action-btn danger" onclick="hubRejectConnection('${c.id}')"><i class="fas fa-times"></i> Decline</button>
            </div>`;
        }).join(''):'<p class="muted" style="padding:12px;">No pending requests.</p>'}

        <h3 class="hub-section-title"><i class="fas fa-paper-plane"></i> Sent Requests (${sent.length})</h3>
        ${sent.length?sent.map(c=>{
            const u = hubGetUser(c.toUserId);
            if(!u) return '';
            return `<div class="hub-req-row">
                <div class="hub-member-avatar"><img src="${hubUserPic(u.id)}"></div>
                <div class="hub-member-info"><div class="hub-member-name">${esc(u.name)}</div><div class="hub-member-role">Awaiting response</div></div>
            </div>`;
        }).join(''):'<p class="muted" style="padding:12px;">No sent requests.</p>'}

        <h3 class="hub-section-title"><i class="fas fa-handshake"></i> My Connections (${myConns.length})</h3>
        ${myConns.length?myConns.map(c=>{
            const otherId = c.fromUserId===userId?c.toUserId:c.fromUserId;
            const u = hubGetUser(otherId);
            if(!u) return '';
            return `<div class="hub-member-card">
                <div class="hub-member-avatar"><img src="${hubUserPic(u.id)}"></div>
                <div class="hub-member-info">
                    <div class="hub-member-name">${esc(u.name)}</div>
                    <div class="hub-member-role">${esc(u.country||'')} · ${esc(u.category||'')}</div>
                </div>
                <div class="hub-member-actions">
                    <button class="hub-action-btn" onclick="hubStartConversation('${u.id}')"><i class="fas fa-envelope"></i> Message</button>
                    <button class="hub-action-btn danger" onclick="hubRemoveConnection('${c.id}')"><i class="fas fa-user-minus"></i></button>
                </div>
            </div>`;
        }).join(''):'<p class="muted" style="padding:12px;">No connections yet. Start networking!</p>'}
    `;
}

window.hubSendConnectionRequest = function(toUserId){
    const fromUserId = AUTH.current.id;
    if(fromUserId===toUserId) return;
    const existing = DB.diasporaConnections.find(c=>
        (c.fromUserId===fromUserId&&c.toUserId===toUserId)||(c.fromUserId===toUserId&&c.toUserId===fromUserId)
    );
    if(existing){ notify('Connection already exists','info'); return; }
    DB.add('diasporaConnections',{fromUserId,toUserId,status:'pending',createdAt:new Date().toISOString()});
    hubNotifyUser(toUserId,'connection_request','New Connection Request',`${AUTH.profile.name} wants to connect with you.`);
    notify('Connection request sent!','success');
    switchHubTab(currentHubTab);
};

window.hubAcceptConnection = function(connectionId){
    const c = DB.find('diasporaConnections',connectionId);
    if(!c) return;
    DB.update('diasporaConnections',connectionId,{status:'accepted',acceptedAt:new Date().toISOString()});
    hubNotifyUser(c.fromUserId,'connection_accepted','Connection Accepted',`${AUTH.profile.name} accepted your connection request.`);
    notify('Connection accepted!','success');
    switchHubTab('connections');
};

window.hubRejectConnection = function(connectionId){
    DB.update('diasporaConnections',connectionId,{status:'declined'});
    notify('Connection declined','info');
    switchHubTab(currentHubTab);
};

window.hubRemoveConnection = async function(connectionId){
    if(!(await confirmAction('Remove this connection?'))) return;
    DB.remove('diasporaConnections',connectionId);
    notify('Connection removed','success');
    switchHubTab('connections');
};

window.hubToggleFollow = function(userId){
    const me = AUTH.current.id;
    const existing = DB.diasporaFollows.find(f=>f.followerId===me&&f.followingId===userId);
    if(existing){ DB.remove('diasporaFollows',existing.id); notify('Unfollowed','info'); }
    else{
        DB.add('diasporaFollows',{followerId:me,followingId:userId,followedAt:new Date().toISOString()});
        hubNotifyUser(userId,'new_follower','New Follower',`${AUTH.profile.name} started following you.`);
        notify('Now following','success');
    }
    switchHubTab(currentHubTab);
};

/* -------- 9. CHAPTERS TAB -------- */
function renderHubChapters(wrap){
    const userId = AUTH.current.id;
    wrap.innerHTML = `
        <p class="muted" style="margin-bottom:14px;">Join your country chapter to connect with members from your region.</p>
        <div class="hub-grid-3">${DB.diasporaChapters.map(c=>{
            const joined = DB.diasporaChapterMembers.some(m=>m.chapterId===c.id&&m.userId===userId);
            const memberCount = DB.diasporaChapterMembers.filter(m=>m.chapterId===c.id).length;
            const postCount = DB.diasporaPosts.filter(p=>p.groupName===c.name).length;
            return `<div class="hub-chapter-card" onclick="hubShowChapter('${c.id}')">
                <div class="hub-chapter-banner"><img src="${esc(c.banner||placeholderImage(c.name,'#FFD700','#B8860B'))}"></div>
                <div class="hub-chapter-body">
                    <div class="hub-chapter-name">${esc(c.name)}</div>
                    <div class="hub-chapter-meta">${esc(c.description||'')}</div>
                    <div class="hub-chapter-stats">
                        <span><i class="fas fa-users"></i> ${memberCount}</span>
                        <span><i class="fas fa-comments"></i> ${postCount}</span>
                    </div>
                    <button class="hub-action-btn ${joined?'success':'primary'}" onclick="event.stopPropagation(); hubToggleChapterJoin('${c.id}')">
                        <i class="fas fa-${joined?'check':'plus'}"></i> ${joined?'Joined':'Join Chapter'}
                    </button>
                </div>
            </div>`;
        }).join('')}</div>
    `;
}

window.hubToggleChapterJoin = function(chapterId){
    const userId = AUTH.current.id;
    const existing = DB.diasporaChapterMembers.find(m=>m.chapterId===chapterId&&m.userId===userId);
    if(existing){ DB.remove('diasporaChapterMembers',existing.id); notify('Left chapter','info'); }
    else{ DB.add('diasporaChapterMembers',{chapterId,userId,role:'member',joinedAt:new Date().toISOString()}); notify('Joined chapter!','success'); }
    switchHubTab('chapters');
};

window.hubShowChapter = function(chapterId){
    const c = DB.find('diasporaChapters',chapterId);
    if(!c) return;
    const userId = AUTH.current.id;
    const members = DB.diasporaChapterMembers.filter(m=>m.chapterId===chapterId);
    const posts = DB.diasporaPosts.filter(p=>p.groupName===c.name).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    const joined = members.some(m=>m.userId===userId);

    const wrap = document.getElementById('hubContent');
    wrap.innerHTML = `
        <button class="back-to-menu-btn" onclick="switchHubTab('chapters')" style="margin-bottom:14px;"><i class="fas fa-arrow-left"></i> Back to Chapters</button>
        <div class="hub-chapter-card" style="cursor:default;">
            <div class="hub-chapter-banner" style="height:120px;"><img src="${esc(c.banner||placeholderImage(c.name,'#FFD700','#B8860B'))}"></div>
            <div class="hub-chapter-body">
                <div class="hub-chapter-name" style="font-size:1.3rem;">${esc(c.name)}</div>
                <div class="hub-chapter-meta">${esc(c.description||'')}</div>
                <div class="hub-chapter-stats" style="margin-top:8px;">
                    <span><i class="fas fa-users"></i> ${members.length} members</span>
                    <span><i class="fas fa-comments"></i> ${posts.length} posts</span>
                </div>
                <button class="hub-action-btn ${joined?'success':'primary'}" onclick="hubToggleChapterJoin('${chapterId}')"><i class="fas fa-${joined?'check':'plus'}"></i> ${joined?'Joined':'Join Chapter'}</button>
            </div>
        </div>

        <h3 class="hub-section-title"><i class="fas fa-comments"></i> Chapter Discussions</h3>
        <form id="hubChapterPostForm" class="admin-form" style="margin-bottom:14px;">
            <textarea id="hubChapterPostContent" rows="3" placeholder="Post to ${esc(c.name)}..." required></textarea>
            <button type="submit" class="auth-btn" style="margin-top:8px;"><i class="fas fa-paper-plane"></i> POST</button>
        </form>
        <div>${posts.length?posts.map(p=>`<div class="hub-forum-post"><div class="hub-forum-author"><strong>${esc(p.authorName)}</strong><small>${new Date(p.createdAt).toLocaleString()}</small></div><div class="hub-forum-content">${esc(p.content)}</div></div>`).join(''):'<p class="muted" style="padding:12px;">No discussions yet. Be the first!</p>'}</div>
    `;

    document.getElementById('hubChapterPostForm').addEventListener('submit',e=>{
        e.preventDefault();
        const content = document.getElementById('hubChapterPostContent').value.trim();
        if(!content) return;
        DB.add('diasporaPosts',{groupName:c.name,authorName:AUTH.profile.name,authorId:AUTH.current.id,content,createdAt:new Date().toISOString()});
        notify('Posted!','success');
        hubShowChapter(chapterId);
    });
};

/* -------- 10. COMMUNITIES TAB -------- */
function renderHubCommunities(wrap){
    const userId = AUTH.current.id;
    wrap.innerHTML = `
        <p class="muted" style="margin-bottom:14px;">Join interest-based communities to connect with like-minded members.</p>
        <div class="hub-grid-3">${DB.diasporaCommunities.map(c=>{
            const joined = DB.diasporaCommunityMembers.some(m=>m.communityId===c.id&&m.userId===userId);
            const memberCount = DB.diasporaCommunityMembers.filter(m=>m.communityId===c.id).length;
            return `<div class="hub-chapter-card" style="cursor:default;">
                <div class="hub-chapter-body" style="padding:16px;">
                    <div style="font-size:2rem; color:var(--gold-primary); margin-bottom:8px; text-align:center;"><i class="fas ${c.icon||'fa-users'}"></i></div>
                    <div class="hub-chapter-name" style="text-align:center;">${esc(c.name)}</div>
                    <div class="hub-chapter-meta" style="text-align:center; margin-bottom:10px;">${esc(c.description||'')}</div>
                    <div class="hub-chapter-stats" style="justify-content:center;"><span><i class="fas fa-users"></i> ${memberCount} members</span></div>
                    <div style="text-align:center; margin-top:8px;">
                        <button class="hub-action-btn ${joined?'success':'primary'}" onclick="hubToggleCommunityJoin('${c.id}')"><i class="fas fa-${joined?'check':'plus'}"></i> ${joined?'Joined':'Join Community'}</button>
                    </div>
                </div>
            </div>`;
        }).join('')}</div>
    `;
}

window.hubToggleCommunityJoin = function(communityId){
    const userId = AUTH.current.id;
    const existing = DB.diasporaCommunityMembers.find(m=>m.communityId===communityId&&m.userId===userId);
    if(existing){ DB.remove('diasporaCommunityMembers',existing.id); notify('Left community','info'); }
    else{ DB.add('diasporaCommunityMembers',{communityId,userId,joinedAt:new Date().toISOString()}); notify('Joined community!','success'); }
    switchHubTab('communities');
};

/* -------- 11. FORUM TAB -------- */
let hubForumCategory = 'all';

function renderHubForum(wrap){
    const categories = ['all','History & Heritage','Pan-Africanism','Tourism','Business Opportunities','Education','Art & Culture','Music & Entertainment','PANAFEST Experiences','Diaspora Stories'];
    let posts = [...DB.diasporaForumPosts];
    if(hubForumCategory!=='all') posts = posts.filter(p=>p.category===hubForumCategory);
    posts.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

    wrap.innerHTML = `
        <form id="hubNewPostForm" class="admin-form" style="margin-bottom:16px;">
            <h3 style="color:var(--gold-primary); margin-bottom:10px;"><i class="fas fa-pen"></i> Create a Post</h3>
            <div class="form-row two-col">
                <select id="hubNewPostCategory" required>
                    <option value="">— Category —</option>
                    ${categories.slice(1).map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}
                </select>
                <input type="text" id="hubNewPostTitle" placeholder="Post title" required>
            </div>
            <textarea id="hubNewPostContent" placeholder="Share your thoughts, questions, or experiences..." rows="3" required></textarea>
            <button type="submit" class="auth-btn" style="margin-top:8px;"><i class="fas fa-paper-plane"></i> POST</button>
        </form>

        <div class="mp-filter-bar" style="margin-bottom:12px;">
            <select id="hubForumCatFilter" class="mp-select">
                ${categories.map(c=>`<option value="${c}" ${hubForumCategory===c?'selected':''}>${c==='all'?'All Categories':c}</option>`).join('')}
            </select>
        </div>

        <div id="hubForumPostsList"></div>
    `;

    document.getElementById('hubNewPostForm').addEventListener('submit',e=>{
        e.preventDefault();
        const category = document.getElementById('hubNewPostCategory').value;
        const title = document.getElementById('hubNewPostTitle').value.trim();
        const content = document.getElementById('hubNewPostContent').value.trim();
        if(!category||!title||!content){ notify('Fill all fields','error'); return; }
        DB.add('diasporaForumPosts',{
            category,title,content,
            authorId:AUTH.current.id,authorName:AUTH.profile.name,
            likes:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
        });
        notify('Post created!','success');
        renderHubForum(wrap);
    });

    document.getElementById('hubForumCatFilter').onchange = (e)=>{
        hubForumCategory = e.target.value;
        renderHubForum(wrap);
    };

    const list = document.getElementById('hubForumPostsList');
    if(!posts.length){ list.innerHTML = '<div class="hub-empty"><i class="fas fa-comments"></i><p>No posts in this category yet.</p></div>'; return; }
    list.innerHTML = posts.map(p=>{
        const liked = (p.likes||[]).includes(AUTH.current.id);
        const replies = DB.diasporaForumReplies.filter(r=>r.postId===p.id);
        return `<div class="hub-forum-post">
            <div class="hub-forum-header">
                <div class="hub-forum-avatar"><img src="${hubUserPic(p.authorId)}"></div>
                <div class="hub-forum-author"><strong>${esc(p.authorName)}</strong><small>${new Date(p.createdAt).toLocaleString()} · ${esc(p.category)}</small></div>
            </div>
            <div class="hub-forum-title">${esc(p.title)}</div>
            <div class="hub-forum-content">${esc(p.content)}</div>
            <div class="hub-forum-actions">
                <button class="${liked?'liked':''}" onclick="hubLikePost('${p.id}')"><i class="fas fa-heart"></i> ${(p.likes||[]).length}</button>
                <button onclick="hubToggleReplies('${p.id}')"><i class="fas fa-comment"></i> ${replies.length} replies</button>
            </div>
            <div id="hubReplies-${p.id}" style="display:none; margin-top:10px; padding-top:10px; border-top:1px solid var(--glass-edge);">
                ${replies.map(r=>`<div style="padding:8px 0; border-bottom:1px solid var(--glass-edge);"><strong>${esc(r.authorName)}</strong> <small style="color:var(--text-secondary);">${new Date(r.createdAt).toLocaleString()}</small><p style="font-size:0.82rem; color:var(--text-secondary); margin-top:4px;">${esc(r.content)}</p></div>`).join('')}
                <div style="display:flex; gap:6px; margin-top:8px;">
                    <input type="text" id="hubReply-${p.id}" placeholder="Reply..." style="flex:1; padding:8px 12px; background:rgba(0,0,0,0.4); border:1px solid var(--glass-edge); border-radius:10px; color:var(--text-primary); font-family:inherit;">
                    <button class="hub-action-btn primary" onclick="hubAddReply('${p.id}')"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>`;
    }).join('');
}

window.hubLikePost = function(postId){
    const p = DB.find('diasporaForumPosts',postId);
    if(!p) return;
    const likes = p.likes||[];
    const idx = likes.indexOf(AUTH.current.id);
    if(idx>=0) likes.splice(idx,1);
    else{
        likes.push(AUTH.current.id);
        if(p.authorId!==AUTH.current.id) hubNotifyUser(p.authorId,'post_like','Post Liked',`${AUTH.profile.name} liked your post.`);
    }
    DB.update('diasporaForumPosts',postId,{likes});
    renderHubForum(document.getElementById('hubContent'));
};

window.hubToggleReplies = function(postId){
    const el = document.getElementById('hubReplies-'+postId);
    if(!el) return;
    el.style.display = el.style.display==='none'?'block':'none';
};

window.hubAddReply = function(postId){
    const input = document.getElementById('hubReply-'+postId);
    const content = input?.value.trim();
    if(!content) return;
    const p = DB.find('diasporaForumPosts',postId);
    DB.add('diasporaForumReplies',{
        postId,content,
        authorId:AUTH.current.id,authorName:AUTH.profile.name,
        createdAt:new Date().toISOString()
    });
    if(p&&p.authorId!==AUTH.current.id) hubNotifyUser(p.authorId,'post_reply','New Reply',`${AUTH.profile.name} replied to your post.`);
    notify('Reply added','success');
    renderHubForum(document.getElementById('hubContent'));
};

/* -------- 12. MESSAGES TAB -------- */
let hubActiveConversation = null;

function renderHubMessages(wrap){
    const userId = AUTH.current.id;
    // Build conversation list: unique partners
    const partnerIds = new Set();
    DB.diasporaMessages.forEach(m=>{
        if(m.fromUserId===userId) partnerIds.add(m.toUserId);
        else if(m.toUserId===userId) partnerIds.add(m.fromUserId);
    });
    const partners = Array.from(partnerIds).map(id=>hubGetUser(id)).filter(Boolean);
    const allUsers = DB.users.filter(u=>u.role!=='admin'&&u.id!==userId);

    wrap.innerHTML = `
        <div class="hub-chat-layout">
            <div class="hub-chat-list">
                <div style="padding:6px 8px; margin-bottom:6px;">
                    <select id="hubNewChatSelect" style="width:100%; padding:8px; background:rgba(0,0,0,0.4); border:1px solid var(--glass-edge); border-radius:10px; color:var(--text-primary); font-family:inherit; font-size:0.78rem;">
                        <option value="">+ Start new chat...</option>
                        ${allUsers.map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('')}
                    </select>
                </div>
                ${partners.length?partners.map(u=>{
                    const msgs = DB.diasporaMessages.filter(m=>(m.fromUserId===userId&&m.toUserId===u.id)||(m.fromUserId===u.id&&m.toUserId===userId));
                    const last = msgs.sort((a,b)=>new Date(b.sentAt)-new Date(a.sentAt))[0];
                    const unread = msgs.filter(m=>m.toUserId===userId&&!(m.readBy||[]).includes(userId)).length;
                    const active = hubActiveConversation===u.id;
                    return `<div class="hub-chat-item ${active?'active':''}" onclick="hubOpenChat('${u.id}')">
                        <div class="hub-chat-item-avatar"><img src="${hubUserPic(u.id)}"></div>
                        <div class="hub-chat-item-info">
                            <div class="hub-chat-item-name">${esc(u.name)} ${unread>0?`<span class="hub-badge">${unread}</span>`:''}</div>
                            <div class="hub-chat-item-preview">${last?esc((last.content||'').slice(0,40)):'No messages yet'}</div>
                        </div>
                    </div>`;
                }).join(''):'<p class="muted" style="padding:12px; font-size:0.75rem;">No conversations yet. Start one above!</p>'}
            </div>
            <div class="hub-chat-window" id="hubChatWindow">
                ${hubActiveConversation?renderActiveChat(hubActiveConversation):'<div class="hub-empty"><i class="fas fa-envelope-open"></i><p>Select a conversation to start messaging</p></div>'}
            </div>
        </div>
    `;

    document.getElementById('hubNewChatSelect').onchange = (e)=>{
        if(e.target.value){ hubStartConversation(e.target.value); }
    };

    // Set up chat send if active
    if(hubActiveConversation){
        const sendBtn = document.getElementById('hubChatSendBtn');
        const input = document.getElementById('hubChatInput');
        if(sendBtn&&input){
            sendBtn.onclick = ()=>hubSendMessage();
            input.onkeydown = (e)=>{ if(e.key==='Enter') hubSendMessage(); };
        }
    }
}

function renderActiveChat(partnerId){
    const userId = AUTH.current.id;
    const partner = hubGetUser(partnerId);
    if(!partner) return '<div class="hub-empty"><i class="fas fa-user-slash"></i><p>User not found</p></div>';
    const msgs = DB.diasporaMessages.filter(m=>(m.fromUserId===userId&&m.toUserId===partnerId)||(m.fromUserId===partnerId&&m.toUserId===userId))
        .sort((a,b)=>new Date(a.sentAt)-new Date(b.sentAt));
    // Mark incoming as read
    msgs.forEach(m=>{
        if(m.toUserId===userId&&!(m.readBy||[]).includes(userId)){
            const readBy = m.readBy||[];
            readBy.push(userId);
            DB.update('diasporaMessages',m.id,{readBy});
        }
    });
    return `
        <div class="hub-chat-header"><i class="fas fa-user-circle"></i> ${esc(partner.name)}</div>
        <div class="hub-chat-messages" id="hubChatMessages">
            ${msgs.length?msgs.map(m=>`<div class="hub-msg ${m.fromUserId===userId?'out':'in'}">${esc(m.content)}<span class="hub-msg-time">${new Date(m.sentAt).toLocaleString()}</span></div>`).join(''):'<p class="muted" style="text-align:center; padding:20px;">Start a conversation!</p>'}
        </div>
        <div class="hub-chat-input">
            <input type="text" id="hubChatInput" placeholder="Type message...">
            <button id="hubChatSendBtn"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
}

window.hubOpenChat = function(partnerId){
    hubActiveConversation = partnerId;
    renderHubMessages(document.getElementById('hubContent'));
    setTimeout(()=>{
        const el = document.getElementById('hubChatMessages');
        if(el) el.scrollTop = el.scrollHeight;
    },50);
};

window.hubStartConversation = function(partnerId){
    hubActiveConversation = partnerId;
    switchHubTab('messages');
};

window.hubSendMessage = function(){
    const input = document.getElementById('hubChatInput');
    const content = input?.value.trim();
    if(!content||!hubActiveConversation) return;
    DB.add('diasporaMessages',{
        fromUserId:AUTH.current.id,
        toUserId:hubActiveConversation,
        content,
        sentAt:new Date().toISOString(),
        readBy:[AUTH.current.id]
    });
    hubNotifyUser(hubActiveConversation,'new_message','New Message',`${AUTH.profile.name} sent you a message.`);
    input.value = '';
    renderHubMessages(document.getElementById('hubContent'));
    setTimeout(()=>{
        const el = document.getElementById('hubChatMessages');
        if(el) el.scrollTop = el.scrollHeight;
    },50);
};

/* -------- 13. STORIES TAB -------- */
function renderHubStories(wrap){
    const stories = [...DB.diasporaStories].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    const featured = stories.filter(s=>s.featured);

    wrap.innerHTML = `
        <h3 class="hub-section-title"><i class="fas fa-pen"></i> Share Your Story</h3>
        <form id="hubNewStoryForm" class="admin-form" style="margin-bottom:20px;">
            <div class="form-row two-col">
                <select id="hubStoryCategory" required>
                    <option value="">— Category —</option>
                    <option>Heritage Stories</option><option>Family History</option>
                    <option>Cultural Traditions</option><option>Migration Stories</option>
                    <option>Homecoming</option><option>Historical Discoveries</option>
                </select>
                <input type="text" id="hubStoryTitle" placeholder="Story title" required>
            </div>
            <textarea id="hubStoryContent" placeholder="Tell your story..." rows="4" required></textarea>
            <button type="submit" class="auth-btn" style="margin-top:8px;"><i class="fas fa-book"></i> PUBLISH STORY</button>
        </form>

        ${featured.length?`<h3 class="hub-section-title"><i class="fas fa-star"></i> Featured Stories</h3>${featured.map(s=>renderStoryCard(s)).join('')}`:''}

        <h3 class="hub-section-title"><i class="fas fa-book-open"></i> All Stories</h3>
        ${stories.length?stories.map(s=>renderStoryCard(s)).join(''):'<div class="hub-empty"><i class="fas fa-book"></i><p>No stories yet. Be the first!</p></div>'}
    `;

    document.getElementById('hubNewStoryForm').addEventListener('submit',e=>{
        e.preventDefault();
        const category = document.getElementById('hubStoryCategory').value;
        const title = document.getElementById('hubStoryTitle').value.trim();
        const content = document.getElementById('hubStoryContent').value.trim();
        if(!category||!title||!content){ notify('Fill all fields','error'); return; }
        DB.add('diasporaStories',{
            title,category,content,featured:false,likes:[],
            authorId:AUTH.current.id,authorName:AUTH.profile.name,
            createdAt:new Date().toISOString()
        });
        notify('Story published!','success');
        renderHubStories(wrap);
    });
}

function renderStoryCard(s){
    const liked = (s.likes||[]).includes(AUTH.current.id);
    return `<div class="hub-story-card">
        <div class="hub-story-body">
            <div class="hub-story-title">${s.featured?'<i class="fas fa-star" style="color:var(--gold-primary);"></i> ':''}${esc(s.title)}</div>
            <div class="hub-story-meta">${esc(s.authorName)} · ${esc(s.category)} · ${new Date(s.createdAt).toLocaleDateString()}</div>
            <div class="hub-story-excerpt">${esc(s.content)}</div>
            <div style="margin-top:8px;">
                <button class="hub-action-btn ${liked?'success':''}" onclick="hubLikeStory('${s.id}')"><i class="fas fa-heart"></i> ${(s.likes||[]).length}</button>
            </div>
        </div>
    </div>`;
}

window.hubLikeStory = function(storyId){
    const s = DB.find('diasporaStories',storyId);
    if(!s) return;
    const likes = s.likes||[];
    const idx = likes.indexOf(AUTH.current.id);
    if(idx>=0) likes.splice(idx,1);
    else likes.push(AUTH.current.id);
    DB.update('diasporaStories',storyId,{likes});
    renderHubStories(document.getElementById('hubContent'));
};

/* -------- 14. BUSINESS TAB -------- */
function renderHubBusiness(wrap){
    const listings = [...DB.diasporaBusinessListings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    wrap.innerHTML = `
        <form id="hubNewBizForm" class="admin-form" style="margin-bottom:20px;">
            <h3 style="color:var(--gold-primary); margin-bottom:10px;"><i class="fas fa-plus-circle"></i> Create Listing</h3>
            <div class="form-row two-col">
                <select id="hubBizType" required>
                    <option value="">— I am —</option>
                    <option value="seeking">Seeking (investor, partner, customer)</option>
                    <option value="offering">Offering (service, product, opportunity)</option>
                </select>
                <input type="text" id="hubBizCategory" placeholder="Category (e.g., Investment, Partnership)" required>
            </div>
            <input type="text" id="hubBizTitle" placeholder="Listing title" required style="margin-bottom:10px; width:100%; padding:12px 16px; background:rgba(0,0,0,0.45); border:1px solid var(--glass-edge); border-radius:12px; color:var(--text-primary); font-family:inherit;">
            <textarea id="hubBizDesc" placeholder="Description" rows="3" required></textarea>
            <input type="text" id="hubBizContact" placeholder="Contact (email or phone)" required style="margin-bottom:10px; width:100%; padding:12px 16px; background:rgba(0,0,0,0.45); border:1px solid var(--glass-edge); border-radius:12px; color:var(--text-primary); font-family:inherit;">
            <button type="submit" class="auth-btn"><i class="fas fa-paper-plane"></i> PUBLISH LISTING</button>
        </form>

        <h3 class="hub-section-title"><i class="fas fa-briefcase"></i> Business Listings (${listings.length})</h3>
        ${listings.length?listings.map(b=>`<div class="hub-biz-card">
            <span class="hub-biz-type ${b.type}">${b.type==='seeking'?'SEEKING':'OFFERING'} · ${esc(b.category)}</span>
            <div class="hub-biz-title">${esc(b.title)}</div>
            <div class="hub-biz-desc">${esc(b.description)}</div>
            <div class="hub-story-meta">${esc(b.userName||'Anonymous')} · ${new Date(b.createdAt).toLocaleDateString()}${b.contact?' · '+esc(b.contact):''}</div>
        </div>`).join(''):'<div class="hub-empty"><i class="fas fa-briefcase"></i><p>No listings yet.</p></div>'}
    `;

    document.getElementById('hubNewBizForm').addEventListener('submit',e=>{
        e.preventDefault();
        const data = {
            type: document.getElementById('hubBizType').value,
            category: document.getElementById('hubBizCategory').value.trim(),
            title: document.getElementById('hubBizTitle').value.trim(),
            description: document.getElementById('hubBizDesc').value.trim(),
            contact: document.getElementById('hubBizContact').value.trim(),
            userId: AUTH.current.id,
            userName: AUTH.profile.name,
            createdAt: new Date().toISOString()
        };
        if(!data.type||!data.category||!data.title||!data.description){ notify('Fill all fields','error'); return; }
        DB.add('diasporaBusinessListings',data);
        notify('Listing published!','success');
        renderHubBusiness(wrap);
    });
}

/* -------- 15. NOTIFICATIONS TAB -------- */
function renderHubNotifications(wrap){
    const userId = AUTH.current.id;
    const notifs = DB.diasporaNotifications.filter(n=>n.userId===userId).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

    wrap.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 class="hub-section-title" style="margin:0;"><i class="fas fa-bell"></i> Notifications (${notifs.length})</h3>
            ${notifs.some(n=>!n.read)?`<button class="hub-action-btn" onclick="hubMarkAllRead()"><i class="fas fa-check-double"></i> Mark all read</button>`:''}
        </div>
        ${notifs.length?notifs.map(n=>`<div class="hub-notif ${n.read?'':'unread'}">
            <div class="hub-notif-icon"><i class="fas fa-${notifIcon(n.type)}"></i></div>
            <div class="hub-notif-content">
                <div class="hub-notif-title">${esc(n.title)}</div>
                <div class="hub-notif-message">${esc(n.message)}</div>
                <div class="hub-notif-time">${new Date(n.createdAt).toLocaleString()}</div>
            </div>
            ${!n.read?`<button class="hub-action-btn" onclick="hubMarkRead('${n.id}')"><i class="fas fa-check"></i></button>`:''}
        </div>`).join(''):'<div class="hub-empty"><i class="fas fa-bell-slash"></i><p>No notifications yet.</p></div>'}
    `;
}

function notifIcon(type){
    const m = {connection_request:'user-plus',connection_accepted:'check',new_follower:'user-friends',new_message:'envelope',post_like:'heart',post_reply:'reply',event_update:'calendar'};
    return m[type]||'bell';
}

window.hubMarkRead = function(notifId){
    DB.update('diasporaNotifications',notifId,{read:true});
    renderHubNotifications(document.getElementById('hubContent'));
    hubUpdateBadges();
};

window.hubMarkAllRead = function(){
    DB.diasporaNotifications.filter(n=>n.userId===AUTH.current.id&&!n.read).forEach(n=>{
        DB.update('diasporaNotifications',n.id,{read:true});
    });
    notify('All notifications read','success');
    renderHubNotifications(document.getElementById('hubContent'));
    hubUpdateBadges();
};

/* -------- 16. ADMIN: DIASPORA HUB MANAGEMENT -------- */
function initAdminDiasporaHub(){
    document.querySelectorAll('#adminHubTabs .hub-tab').forEach(btn=>{
        btn.onclick = ()=>switchAdminHubTab(btn.dataset.adminHubTab);
    });
    switchAdminHubTab('members');
}

function switchAdminHubTab(tab){
    currentAdminHubTab = tab;
    document.querySelectorAll('#adminHubTabs .hub-tab').forEach(b=>b.classList.toggle('active-hub-tab',b.dataset.adminHubTab===tab));
    const wrap = document.getElementById('adminHubContent');
    if(!wrap) return;
    switch(tab){
        case 'members': renderAdminHubMembers(wrap); break;
        case 'chapters': renderAdminHubChapters(wrap); break;
        case 'communities': renderAdminHubCommunities(wrap); break;
        case 'forum': renderAdminHubForum(wrap); break;
        case 'reports': renderAdminHubReports(wrap); break;
        case 'analytics': renderAdminHubAnalytics(wrap); break;
    }
}

function renderAdminHubMembers(wrap){
    const members = DB.users.filter(u=>u.role!=='admin');
    wrap.innerHTML = `
        <h3 class="hub-section-title"><i class="fas fa-users"></i> All Hub Members (${members.length})</h3>
        <div class="table-wrapper">
            <table class="panafest-table">
                <thead><tr><th>Name</th><th>Email</th><th>Country</th><th>Category</th><th>Completion</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>${members.map(m=>{
                    const p = hubGetProfile(m.id);
                    const connCount = DB.diasporaConnections.filter(c=>(c.fromUserId===m.id||c.toUserId===m.id)&&c.status==='accepted').length;
                    return `<tr>
                        <td><strong>${esc(m.name)}</strong>${p?.verified?' <i class="fas fa-check-circle" style="color:var(--info-glow);"></i>':''}</td>
                        <td>${esc(m.email)}</td>
                        <td>${esc(m.country||'')}</td>
                        <td><span class="status-badge">${esc(m.category||'')}</span></td>
                        <td>${p?.completion||0}%</td>
                        <td><span class="status-badge ${m.status==='suspended'?'status-danger':'status-success'}">${esc((m.status||'active').toUpperCase())}</span></td>
                        <td>
                            <button class="hub-action-btn ${p?.verified?'success':''}" onclick="adminHubVerifyUser('${m.id}')"><i class="fas fa-${p?.verified?'check-circle':'shield-alt'}"></i> ${p?.verified?'Verified':'Verify'}</button>
                            <button class="hub-action-btn ${m.status==='suspended'?'success':'danger'}" onclick="adminHubToggleSuspend('${m.id}')"><i class="fas fa-${m.status==='suspended'?'check':'ban'}"></i></button>
                        </td>
                    </tr>`;
                }).join('')}</tbody>
            </table>
        </div>
    `;
}

window.adminHubVerifyUser = function(userId){
    const p = hubGetProfile(userId);
    if(!p) return;
    DB.update('diasporaProfiles',p.id,{verified:!p.verified});
    notify(p.verified?'Unverified':'User verified','success');
    renderAdminHubMembers(document.getElementById('adminHubContent'));
};

window.adminHubToggleSuspend = async function(userId){
    const u = DB.find('users',userId);
    if(!u) return;
    const next = u.status==='suspended'?'active':'suspended';
    if(!(await confirmAction(`Set ${u.name} to ${next}?`))) return;
    DB.update('users',userId,{status:next});
    notify(`User ${next}`,'success');
    renderAdminHubMembers(document.getElementById('adminHubContent'));
};

function renderAdminHubChapters(wrap){
    wrap.innerHTML = `
        <form id="adminAddChapterForm" class="admin-form" style="margin-bottom:16px;">
            <h3 style="color:var(--gold-primary); margin-bottom:10px;"><i class="fas fa-plus"></i> Add Chapter</h3>
            <div class="form-row two-col">
                <input type="text" id="acName" placeholder="Chapter name (e.g., Kenya Chapter)" required>
                <input type="text" id="acCountry" placeholder="Country" required>
            </div>
            <textarea id="acDescription" placeholder="Description" rows="2"></textarea>
            <button type="submit" class="auth-btn">ADD CHAPTER</button>
        </form>
        <h3 class="hub-section-title"><i class="fas fa-globe"></i> Chapters (${DB.diasporaChapters.length})</h3>
        ${DB.diasporaChapters.map(c=>{
            const memberCount = DB.diasporaChapterMembers.filter(m=>m.chapterId===c.id).length;
            return `<div class="hub-biz-card">
                <div class="hub-biz-title">${esc(c.name)}</div>
                <div class="hub-biz-desc">${esc(c.description||'')}</div>
                <div class="hub-story-meta">${memberCount} members · Created ${new Date(c.createdAt).toLocaleDateString()}</div>
                <button class="hub-action-btn danger" onclick="adminDeleteChapter('${c.id}')" style="margin-top:8px;"><i class="fas fa-trash"></i> Delete</button>
            </div>`;
        }).join('')}
    `;
    document.getElementById('adminAddChapterForm').addEventListener('submit',e=>{
        e.preventDefault();
        DB.add('diasporaChapters',{
            name:document.getElementById('acName').value.trim(),
            country:document.getElementById('acCountry').value.trim(),
            description:document.getElementById('acDescription').value.trim(),
            banner: placeholderImage(document.getElementById('acName').value.trim(),'#FFD700','#B8860B'),
            createdAt:new Date().toISOString()
        });
        notify('Chapter added','success');
        renderAdminHubChapters(wrap);
    });
}

window.adminDeleteChapter = async function(id){
    if(!(await confirmAction('Delete this chapter?'))) return;
    DB.remove('diasporaChapters',id);
    DB.diasporaChapterMembers.filter(m=>m.chapterId===id).forEach(m=>DB.remove('diasporaChapterMembers',m.id));
    notify('Chapter deleted','success');
    renderAdminHubChapters(document.getElementById('adminHubContent'));
};

function renderAdminHubCommunities(wrap){
    wrap.innerHTML = `
        <form id="adminAddCommunityForm" class="admin-form" style="margin-bottom:16px;">
            <h3 style="color:var(--gold-primary); margin-bottom:10px;"><i class="fas fa-plus"></i> Add Community</h3>
            <div class="form-row two-col">
                <input type="text" id="acmName" placeholder="Community name" required>
                <input type="text" id="acmIcon" placeholder="FontAwesome icon (e.g., fa-book)" value="fa-users">
            </div>
            <textarea id="acmDescription" placeholder="Description" rows="2"></textarea>
            <button type="submit" class="auth-btn">ADD COMMUNITY</button>
        </form>
        <h3 class="hub-section-title"><i class="fas fa-lightbulb"></i> Communities (${DB.diasporaCommunities.length})</h3>
        ${DB.diasporaCommunities.map(c=>{
            const memberCount = DB.diasporaCommunityMembers.filter(m=>m.communityId===c.id).length;
            return `<div class="hub-biz-card">
                <div class="hub-biz-title"><i class="fas ${c.icon}"></i> ${esc(c.name)}</div>
                <div class="hub-biz-desc">${esc(c.description||'')}</div>
                <div class="hub-story-meta">${memberCount} members</div>
                <button class="hub-action-btn danger" onclick="adminDeleteCommunity('${c.id}')" style="margin-top:8px;"><i class="fas fa-trash"></i> Delete</button>
            </div>`;
        }).join('')}
    `;
    document.getElementById('adminAddCommunityForm').addEventListener('submit',e=>{
        e.preventDefault();
        DB.add('diasporaCommunities',{
            name:document.getElementById('acmName').value.trim(),
            icon:document.getElementById('acmIcon').value.trim()||'fa-users',
            category:'General',
            description:document.getElementById('acmDescription').value.trim(),
            createdAt:new Date().toISOString()
        });
        notify('Community added','success');
        renderAdminHubCommunities(wrap);
    });
}

window.adminDeleteCommunity = async function(id){
    if(!(await confirmAction('Delete this community?'))) return;
    DB.remove('diasporaCommunities',id);
    DB.diasporaCommunityMembers.filter(m=>m.communityId===id).forEach(m=>DB.remove('diasporaCommunityMembers',m.id));
    notify('Community deleted','success');
    renderAdminHubCommunities(document.getElementById('adminHubContent'));
};

function renderAdminHubForum(wrap){
    const posts = [...DB.diasporaForumPosts].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    wrap.innerHTML = `
        <h3 class="hub-section-title"><i class="fas fa-comments"></i> Forum Moderation (${posts.length})</h3>
        ${posts.map(p=>{
            const replies = DB.diasporaForumReplies.filter(r=>r.postId===p.id);
            return `<div class="hub-biz-card">
                <div class="hub-story-meta">${esc(p.authorName)} · ${esc(p.category)} · ${new Date(p.createdAt).toLocaleDateString()}</div>
                <div class="hub-biz-title">${esc(p.title)}</div>
                <div class="hub-biz-desc">${esc(p.content)}</div>
                <div class="hub-story-meta">${(p.likes||[]).length} likes · ${replies.length} replies</div>
                <button class="hub-action-btn danger" onclick="adminDeleteForumPost('${p.id}')" style="margin-top:8px;"><i class="fas fa-trash"></i> Delete Post</button>
            </div>`;
        }).join('')||'<p class="muted">No forum posts.</p>'}
    `;
}

window.adminDeleteForumPost = async function(id){
    if(!(await confirmAction('Delete this post and all replies?'))) return;
    DB.diasporaForumReplies.filter(r=>r.postId===id).forEach(r=>DB.remove('diasporaForumReplies',r.id));
    DB.remove('diasporaForumPosts',id);
    notify('Post deleted','success');
    renderAdminHubForum(document.getElementById('adminHubContent'));
};

function renderAdminHubReports(wrap){
    const reports = DB.diasporaReports.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    wrap.innerHTML = `
        <h3 class="hub-section-title"><i class="fas fa-flag"></i> Reported Content (${reports.length})</h3>
        ${reports.length?reports.map(r=>`<div class="hub-biz-card">
            <span class="hub-biz-type seeking">${esc(r.status||'pending').toUpperCase()}</span>
            <div class="hub-biz-title">${esc(r.reason||'No reason')}</div>
            <div class="hub-biz-desc">Reported by: ${esc(hubUserDisplayName(r.reporterId))} · Against: ${esc(hubUserDisplayName(r.reportedUserId))}</div>
            <div class="hub-story-meta">${new Date(r.createdAt).toLocaleString()}</div>
            ${r.status!=='resolved'?`<button class="hub-action-btn success" onclick="adminResolveReport('${r.id}')" style="margin-top:8px;"><i class="fas fa-check"></i> Mark Resolved</button>`:''}
        </div>`).join(''):'<div class="hub-empty"><i class="fas fa-check-circle"></i><p>No reports. Community is healthy!</p></div>'}
    `;
}

window.adminResolveReport = function(id){
    DB.update('diasporaReports',id,{status:'resolved',resolvedAt:new Date().toISOString()});
    notify('Report resolved','success');
    renderAdminHubReports(document.getElementById('adminHubContent'));
};

function renderAdminHubAnalytics(wrap){
    const totalMembers = DB.users.filter(u=>u.role!=='admin').length;
    const countryDist = {};
    DB.users.filter(u=>u.role!=='admin').forEach(u=>{ if(u.country) countryDist[u.country]=(countryDist[u.country]||0)+1; });
    const topCountries = Object.entries(countryDist).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const totalConns = DB.diasporaConnections.filter(c=>c.status==='accepted').length;
    const totalMsgs = DB.diasporaMessages.length;
    const totalPosts = DB.diasporaForumPosts.length;
    const totalChapters = DB.diasporaChapters.length;
    const totalCommunities = DB.diasporaCommunities.length;

    wrap.innerHTML = `
        <div class="hub-stats-grid">
            <div class="hub-stat-card"><i class="fas fa-users"></i><div class="hub-stat-value">${totalMembers}</div><div class="hub-stat-label">Members</div></div>
            <div class="hub-stat-card"><i class="fas fa-handshake"></i><div class="hub-stat-value">${totalConns}</div><div class="hub-stat-label">Connections</div></div>
            <div class="hub-stat-card"><i class="fas fa-envelope"></i><div class="hub-stat-value">${totalMsgs}</div><div class="hub-stat-label">Messages</div></div>
            <div class="hub-stat-card"><i class="fas fa-comments"></i><div class="hub-stat-value">${totalPosts}</div><div class="hub-stat-label">Forum Posts</div></div>
            <div class="hub-stat-card"><i class="fas fa-globe"></i><div class="hub-stat-value">${totalChapters}</div><div class="hub-stat-label">Chapters</div></div>
            <div class="hub-stat-card"><i class="fas fa-lightbulb"></i><div class="hub-stat-value">${totalCommunities}</div><div class="hub-stat-label">Communities</div></div>
        </div>

        <h3 class="hub-section-title"><i class="fas fa-chart-bar"></i> Most Active Countries</h3>
        <div class="table-wrapper">
            <table class="panafest-table">
                <thead><tr><th>Country</th><th>Members</th></tr></thead>
                <tbody>${topCountries.length?topCountries.map(([c,n])=>`<tr><td>${esc(c)}</td><td><strong class="price">${n}</strong></td></tr>`).join(''):'<tr><td colspan="2" style="text-align:center;">No data</td></tr>'}</tbody>
            </table>
        </div>

        <h3 class="hub-section-title"><i class="fas fa-fire"></i> Most Active Chapters</h3>
        <div class="table-wrapper">
            <table class="panafest-table">
                <thead><tr><th>Chapter</th><th>Members</th><th>Posts</th></tr></thead>
                <tbody>${DB.diasporaChapters.map(c=>{
                    const members = DB.diasporaChapterMembers.filter(m=>m.chapterId===c.id).length;
                    const posts = DB.diasporaPosts.filter(p=>p.groupName===c.name).length;
                    return `<tr><td>${esc(c.name)}</td><td>${members}</td><td>${posts}</td></tr>`;
                }).sort((a,b)=>b.posts-a.posts).slice(0,5).join('')}</tbody>
            </table>
        </div>
    `;
}

/* -------- 17. HOOK INTO MODULE ROUTER -------- */
// Wrap the existing navigateToModule to call our initializers
(function(){
    if(typeof window.navigateToModule==='function' && !window.navigateToModule.__hubWrapped){
        const orig = window.navigateToModule;
        window.navigateToModule = function(moduleId){
            const r = orig.apply(this, arguments);
            if(moduleId==='diasporaModule') setTimeout(()=>initDiaspora(),50);
            if(moduleId==='adminDiasporaHubModule') setTimeout(()=>initAdminDiasporaHub(),50);
            return r;
        };
        window.navigateToModule.__hubWrapped = true;
    }
})();

// Add menu items
(function addDiasporaHubMenuItems(){
    // Add to customerMenu if exists
    if(typeof customerMenu!=='undefined' && Array.isArray(customerMenu)){
        if(!customerMenu.find(m=>m.id==='diasporaModule')){
            customerMenu.splice(8,0,{id:'diasporaModule',icon:'fa-globe-africa',title:'Diaspora Hub',desc:'Professional network'});
        }
    }
    // Add to adminMenu
    if(typeof adminMenu!=='undefined' && Array.isArray(adminMenu)){
        if(!adminMenu.find(m=>m.id==='adminDiasporaHubModule')){
            adminMenu.splice(9,0,{id:'adminDiasporaHubModule',icon:'fa-globe-africa',title:'Diaspora Hub',desc:'Networking platform'});
        }
    }
})();

// Ensure diasporaModule init on direct call
window.initDiaspora = initDiaspora;
window.initAdminDiasporaHub = initAdminDiasporaHub;

console.log('[DiasporaHub] Professional networking platform loaded.');

/* ============================================================
   PANAFEST 2027 — MODERN NOTIFICATION & ALERT SYSTEM
   (Appended enhancement — non-invasive, coexists with notify())
   ============================================================ */
(function(){
    'use strict';

    /* ---------------------------------------------------------
       A. Inject scoped styles for the new notification system
       --------------------------------------------------------- */
    if (!document.getElementById('pf-notif-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'pf-notif-styles';
        styleEl.textContent = `
            #pf-notif-container {
                position: fixed; top: 20px; right: 20px;
                z-index: 99999;
                display: flex; flex-direction: column; gap: 12px;
                pointer-events: none;
                max-width: 400px; width: calc(100vw - 40px);
            }
            @media (max-width: 480px) {
                #pf-notif-container { top: 12px; right: 12px; left: 12px; width: auto; max-width: none; }
            }
            .pf-notif {
                pointer-events: auto;
                display: flex; align-items: flex-start; gap: 14px;
                padding: 16px 18px;
                background: rgba(20, 20, 28, 0.97);
                backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 215, 0, 0.25);
                border-radius: 16px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55),
                            0 0 0 1px rgba(255, 215, 0, 0.08) inset,
                            0 0 30px rgba(255, 215, 0, 0.08);
                transform: translateX(120%);
                opacity: 0;
                transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
                position: relative; overflow: hidden;
            }
            .pf-notif.pf-notif-visible { transform: translateX(0); opacity: 1; }
            .pf-notif.pf-notif-hiding { transform: translateX(120%); opacity: 0; }
            .pf-notif::before {
                content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
                background: linear-gradient(90deg, transparent, var(--pf-notif-accent, #FFD700), transparent);
            }
            .pf-notif-icon {
                width: 40px; height: 40px; min-width: 40px;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 1.15rem; color: #0a0a0f;
                background: var(--pf-notif-accent, #FFD700);
                box-shadow: 0 0 20px var(--pf-notif-glow, rgba(255, 215, 0, 0.4));
            }
            .pf-notif-body { flex: 1; min-width: 0; }
            .pf-notif-title {
                font-weight: 700; font-size: 0.92rem; color: #f5f5f0;
                margin-bottom: 4px; letter-spacing: 0.2px;
            }
            .pf-notif-message {
                font-size: 0.82rem; color: #a8a8b8; line-height: 1.45;
                word-break: break-word;
            }
            .pf-notif-close {
                background: transparent; border: none; color: #a8a8b8;
                cursor: pointer; font-size: 1rem; padding: 4px; line-height: 1;
                align-self: flex-start; transition: color 0.2s; flex-shrink: 0;
            }
            .pf-notif-close:hover { color: #FFD700; }
            .pf-notif-progress {
                position: absolute; bottom: 0; left: 0; height: 3px;
                background: var(--pf-notif-accent, #FFD700);
                width: 100%; transform-origin: left;
                border-radius: 0 0 16px 0;
            }
            .pf-notif.pf-notif-visible .pf-notif-progress {
                animation: pfNotifProgress var(--pf-notif-duration, 5000ms) linear forwards;
            }
            @keyframes pfNotifProgress { from { transform: scaleX(1); } to { transform: scaleX(0); } }
            .pf-notif.pf-type-success { --pf-notif-accent: #4ade80; --pf-notif-glow: rgba(74,222,128,0.4); }
            .pf-notif.pf-type-error   { --pf-notif-accent: #ef4444; --pf-notif-glow: rgba(239,68,68,0.4); }
            .pf-notif.pf-type-warning { --pf-notif-accent: #fbbf24; --pf-notif-glow: rgba(251,191,36,0.4); }
            .pf-notif.pf-type-info    { --pf-notif-accent: #3b82f6; --pf-notif-glow: rgba(59,130,246,0.4); }
            .pf-notif.pf-type-gold    { --pf-notif-accent: #FFD700; --pf-notif-glow: rgba(255,215,0,0.4); }
            body.light-mode .pf-notif {
                background: rgba(255, 255, 255, 0.98);
                border-color: rgba(184, 134, 11, 0.3);
            }
            body.light-mode .pf-notif-title { color: #1a1a1a; }
            body.light-mode .pf-notif-message { color: #555; }
            body.light-mode .pf-notif-close { color: #666; }
        `;
        document.head.appendChild(styleEl);
    }

    /* ---------------------------------------------------------
       B. Container
       --------------------------------------------------------- */
    let container = document.getElementById('pf-notif-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'pf-notif-container';
        document.body.appendChild(container);
    }

    /* ---------------------------------------------------------
       C. Core notification function
       --------------------------------------------------------- */
    function pfNotify(title, message, type = 'info', duration = 5000) {
        const icons = { success: 'fa-check', error: 'fa-times', warning: 'fa-exclamation', info: 'fa-info', gold: 'fa-crown' };
        const safe = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        const el = document.createElement('div');
        el.className = `pf-notif pf-type-${type}`;
        el.style.setProperty('--pf-notif-duration', `${duration}ms`);
        el.innerHTML = `
            <div class="pf-notif-icon"><i class="fas ${icons[type] || 'fa-bell'}"></i></div>
            <div class="pf-notif-body">
                <div class="pf-notif-title">${safe(title)}</div>
                <div class="pf-notif-message">${safe(message)}</div>
            </div>
            <button class="pf-notif-close" aria-label="Close"><i class="fas fa-times"></i></button>
            <div class="pf-notif-progress"></div>
        `;
        let dismissed = false, timeoutId = null;
        function dismiss() {
            if (dismissed) return;
            dismissed = true;
            if (timeoutId) clearTimeout(timeoutId);
            el.classList.remove('pf-notif-visible');
            el.classList.add('pf-notif-hiding');
            setTimeout(() => el.remove(), 450);
        }
        el.querySelector('.pf-notif-close').addEventListener('click', dismiss);
        container.appendChild(el);
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('pf-notif-visible')));
        if (duration > 0) timeoutId = setTimeout(dismiss, duration);
        return { dismiss };
    }
    window.pfNotify = pfNotify;

    /* ---------------------------------------------------------
       D. Welcome notification on page open (only if NOT logged in)
       --------------------------------------------------------- */
    function showWelcome() {
        const authModal = document.getElementById('authModal');
        const appContent = document.getElementById('appContent');
        if (!authModal) return;
        const isLoggedIn = appContent && appContent.style.display === 'block';
        if (isLoggedIn) return;
        setTimeout(() => {
            pfNotify(
                '🌍 Welcome to PANAFEST 2027',
                'Please sign-up or login if you have an account. Re-emergence of African Civilization — One Africa · One People · One Destiny.',
                'gold',
                9000
            );
        }, 600);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(showWelcome, 100));
    } else {
        setTimeout(showWelcome, 100);
    }

    /* ---------------------------------------------------------
       E. Announce user's name on successful login / registration
       --------------------------------------------------------- */
    function setupLoginAnnouncer() {
        const appContent = document.getElementById('appContent');
        const currentUserEl = document.getElementById('currentUser');
        if (!appContent || !currentUserEl) return;
        let lastAnnounced = null;

        function announce() {
            if (appContent.style.display !== 'block') return;
            const name = (currentUserEl.textContent || '').trim();
            if (!name || name === 'Loading...' || name === 'User') return;
            if (name === lastAnnounced) return;
            lastAnnounced = name;
            pfNotify(
                '✨ Login Successful',
                `Akwaaba, ${name}! Welcome to PANAFEST 2027 — enjoy the experience.`,
                'success',
                6500
            );
        }

        // Observe visibility toggles
        new MutationObserver(() => setTimeout(announce, 180))
            .observe(appContent, { attributes: true, attributeFilter: ['style'] });

        // Observe name text updates
        new MutationObserver(() => setTimeout(announce, 60))
            .observe(currentUserEl, { childList: true, characterData: true, subtree: true });

        // Session-restore case: also fire once after boot settles
        setTimeout(announce, 400);
        setTimeout(announce, 900);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupLoginAnnouncer);
    } else {
        setupLoginAnnouncer();
    }

    /* ---------------------------------------------------------
       F. Announce DB updates (subtle, filtered)
       --------------------------------------------------------- */
    if (window.DB && typeof window.DB.save === 'function' && !window.DB.save.__pfWrapped) {
        const originalSave = window.DB.save.bind(window.DB);
        const silentCollections = new Set([
            'diasporaMessages', 'diasporaNotifications', 'diasporaFollows',
            'diasporaProfiles', 'diasporaChapterMembers', 'diasporaCommunityMembers',
            'diasporaChapters', 'diasporaCommunities', 'diasporaForumReplies'
        ]);
        const announceMap = {
            programs: { title: '📅 New Program Added', type: 'info' },
            events:   { title: '🕒 Event Schedule Updated', type: 'info' },
            tickets:  { title: '🎫 Ticket Purchased', type: 'success' },
            bookings: { title: '🏨 Booking Received', type: 'success' },
            products: { title: '🛍 Marketplace Updated', type: 'info' },
            feedback: { title: '📝 Feedback Received', type: 'info' },
            donations:{ title: '❤ Donation Recorded', type: 'success' }
        };
        window.DB.save = function (collection) {
            const result = originalSave(collection);
            if (!silentCollections.has(collection) && window.pfNotify && announceMap[collection]) {
                const meta = announceMap[collection];
                // Only announce from the currently logged-in session's perspective,
                // and only when the change is meaningful (avoid spam on seed writes).
                if (window.AUTH && window.AUTH.current) {
                    // Defer to avoid firing during batch seed loops
                    clearTimeout(window.__pfSaveToastTimer);
                    window.__pfSaveToastTimer = setTimeout(() => {
                        window.pfNotify(meta.title, `Update recorded in ${collection}.`, meta.type, 4000);
                    }, 1200);
                }
            }
            return result;
        };
        window.DB.save.__pfWrapped = true;
    }

    console.log('[PANAFEST 2027] Modern notification & alert system loaded.');
})();


/* ============================================================
   PANAFEST 2027 — SOUND ENGINE, VOICE ANNOUNCER & iOS BADGES  v3
   FIXES REFRESH CASE:
   - Detects 'not-allowed' error (browser autoplay policy)
   - Queues the utterance for retry on FIRST user interaction
   - Shows a polite "Tap anywhere to hear" hint
   - Works for both Welcome (logged out) and Login greeting
     (session-restored) on page refresh
   ============================================================ */
(function(){
    'use strict';

    /* ---------------------------------------------------------
       0. PREFERENCES
       --------------------------------------------------------- */
    const Prefs = {
        soundEnabled() { return localStorage.getItem('panafest_sound_enabled') !== 'false'; },
        voiceEnabled() { return localStorage.getItem('panafest_voice_enabled') !== 'false'; }
    };
    window.pfToggleSound = function(){
        const cur = Prefs.soundEnabled();
        localStorage.setItem('panafest_sound_enabled', cur ? 'false' : 'true');
        return !cur;
    };
    window.pfToggleVoice = function(){
        const cur = Prefs.voiceEnabled();
        localStorage.setItem('panafest_voice_enabled', cur ? 'false' : 'true');
        return !cur;
    };

    /* ---------------------------------------------------------
       1. SOUND ENGINE (unchanged — Web Audio tones)
       --------------------------------------------------------- */
    const SoundEngine = {
        _ctx: null, _unlocked: false,
        unlock() {
            if (this._unlocked && this._ctx && this._ctx.state === 'running') return;
            try {
                if (!this._ctx) {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (!AC) return;
                    this._ctx = new AC();
                }
                if (this._ctx.state === 'suspended') {
                    this._ctx.resume().then(() => { this._unlocked = true; }).catch(()=>{});
                } else { this._unlocked = true; }
            } catch(e) {}
        },
        _tone(freq, offset, dur, type, vol) {
            if (!this._ctx) return;
            const t0 = this._ctx.currentTime + offset;
            const osc = this._ctx.createOscillator();
            const gain = this._ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, t0);
            gain.gain.setValueAtTime(0, t0);
            gain.gain.linearRampToValueAtTime(vol || 0.12, t0 + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            osc.connect(gain); gain.connect(this._ctx.destination);
            osc.start(t0); osc.stop(t0 + dur + 0.03);
        },
        play(kind) {
            if (!Prefs.soundEnabled()) return;
            this.unlock(); if (!this._ctx) return;
            const go = () => {
                try {
                    switch (kind) {
                        case 'success': this._tone(880,0,.12,'sine',.13); this._tone(1108,.10,.14,'sine',.12); this._tone(1318,.22,.24,'sine',.11); break;
                        case 'info':    this._tone(659,0,.10,'sine',.10); this._tone(880,.12,.16,'sine',.09); break;
                        case 'warning': this._tone(523,0,.12,'triangle',.11); this._tone(440,.14,.18,'triangle',.10); break;
                        case 'error':   this._tone(220,0,.14,'sawtooth',.08); this._tone(165,.15,.22,'sawtooth',.08); break;
                        case 'gold':    this._tone(523,0,.10,'sine',.12); this._tone(659,.10,.10,'sine',.12); this._tone(784,.20,.10,'sine',.12); this._tone(1047,.30,.34,'sine',.13); break;
                        case 'badge':   this._tone(880,0,.06,'sine',.09); this._tone(1175,.06,.10,'sine',.08); break;
                        default:        this._tone(660,0,.10,'sine',.10);
                    }
                } catch(e) {}
            };
            if (this._ctx.state === 'suspended') { this._ctx.resume().then(go).catch(()=>{}); }
            else { go(); }
        }
    };
    window.pfSound = SoundEngine;

    /* ---------------------------------------------------------
       2. VOICE ANNOUNCER — GESTURE-RETRY FIX
       --------------------------------------------------------- */
    const VoiceAnnouncer = {
        _supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
        _voicesReady: false,
        _voiceList: [],
        _currentUtterance: null,
        _queue: [],
        _busy: false,
        _lastError: null,

        // Retry buffer for browsers blocking speech without gesture
        _pendingGestureRetry: [],
        _gestureRetryAttached: false,
        _hintShown: false,
        _hasUserGesture: false,

        init() {
            if (!this._supported) { console.warn('[pfVoice] speechSynthesis not supported'); return; }
            try {
                const load = () => {
                    const v = window.speechSynthesis.getVoices();
                    if (v && v.length) {
                        this._voiceList = v;
                        if (!this._voicesReady) {
                            this._voicesReady = true;
                            console.log('[pfVoice] Voices loaded:', v.length, '→', v.slice(0,3).map(x=>x.name));
                        }
                    }
                };
                load();
                if (!this._voicesReady) {
                    try { window.speechSynthesis.addEventListener('voiceschanged', load); } catch(e) {}
                    let tries = 0;
                    const iv = setInterval(() => {
                        load(); tries++;
                        if (this._voicesReady || tries > 30) clearInterval(iv);
                    }, 150);
                }
            } catch(e) { console.warn('[pfVoice] init error:', e); }
        },

        _pickVoice() {
            if (!this._voiceList.length) {
                try { this._voiceList = window.speechSynthesis.getVoices() || []; } catch(e) {}
            }
            const voices = this._voiceList;
            if (!voices.length) return null;
            const prefs = [
                v => /en-GB/i.test(v.lang) && /female|samantha|karen|moira|google/i.test(v.name),
                v => /en-GB/i.test(v.lang),
                v => /en-US/i.test(v.lang) && /female|samantha|zira|google/i.test(v.name),
                v => /en-US/i.test(v.lang),
                v => /en/i.test(v.lang)
            ];
            for (const test of prefs) { const f = voices.find(test); if (f) return f; }
            return voices[0];
        },

        speak(text, opts) {
            if (!Prefs.voiceEnabled() || !this._supported || !text) return;
            opts = opts || {};
            const chunks = this._chunk(text, opts.maxChunk || 200);
            chunks.forEach(chunk => { this._queue.push({ text: chunk, opts }); });
            this._processQueue();
        },

        speakNow(text, opts) {
            this.stop();
            this.speak(text, opts);
        },

        _chunk(text, maxLen) {
            if (text.length <= maxLen) return [text];
            const parts = text.match(/[^.!?]+[.!?]+["'”’)]?|[^.!?]+$/g) || [text];
            const chunks = [];
            let cur = '';
            for (const p of parts) {
                if ((cur + p).length > maxLen && cur) { chunks.push(cur.trim()); cur = p; }
                else { cur += p; }
            }
            if (cur.trim()) chunks.push(cur.trim());
            return chunks.length ? chunks : [text];
        },

        _processQueue() {
            if (this._busy || !this._queue.length) return;
            const item = this._queue.shift();
            this._busy = true;
            this._doSpeak(item.text, item.opts);
        },

        _doSpeak(text, opts) {
            try {
                const preDelay = this._voicesReady ? 30 : 400;
                setTimeout(() => {
                    try {
                        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
                            window.speechSynthesis.cancel();
                            setTimeout(() => this._fireUtterance(text, opts), 180);
                        } else {
                            this._fireUtterance(text, opts);
                        }
                    } catch(e) { this._advance(); }
                }, preDelay);
            } catch(e) { this._advance(); }
        },

        _fireUtterance(text, opts) {
            try {
                const u = new SpeechSynthesisUtterance(text);
                u.rate   = opts.rate   != null ? opts.rate   : 0.92;
                u.pitch  = opts.pitch  != null ? opts.pitch  : 1.02;
                u.volume = opts.volume != null ? opts.volume : 1.0;
                u.lang   = opts.lang   || 'en-GB';
                const v = this._pickVoice();
                if (v) u.voice = v;

                u.onstart = () => {
                    console.log('[pfVoice] ▶ speaking:', text.slice(0, 40) + (text.length > 40 ? '…' : ''));
                    this._removeBlockedHint();
                };

                u.onend = () => {
                    this._currentUtterance = null; window._pfCurrentUtterance = null;
                    this._advance();
                };

                u.onerror = (e) => {
                    this._lastError = e && e.error;
                    this._currentUtterance = null;
                    window._pfCurrentUtterance = null;

                    // Autoplay policy blocked speech — retry on first gesture
                    if (e && (e.error === 'not-allowed' || e.error === 'NotAllowedError')) {
                        console.log('[pfVoice] Blocked by autoplay policy — will replay on first tap/click');
                        this._pendingGestureRetry.push({ text, opts });
                        this._ensureGestureRetryListener();
                        this._showBlockedHint();
                    } else if (e && e.error && e.error !== 'interrupted' && e.error !== 'canceled') {
                        console.warn('[pfVoice] speak error:', e.error);
                    }
                    this._advance();
                };

                this._currentUtterance = u;
                window._pfCurrentUtterance = u;

                try { window.speechSynthesis.speak(u); }
                catch(err) { console.warn('[pfVoice] speak threw:', err); this._advance(); }
            } catch(e) { console.warn('[pfVoice] build error:', e); this._advance(); }
        },

        _advance() {
            this._busy = false;
            setTimeout(() => this._processQueue(), 120);
        },

        _ensureGestureRetryListener() {
            if (this._gestureRetryAttached) return;
            this._gestureRetryAttached = true;

            const handler = () => {
                this._hasUserGesture = true;
                this._gestureRetryAttached = false;
                ['pointerdown','keydown','touchstart','click'].forEach(ev =>
                    document.removeEventListener(ev, handler, true)
                );
                // Flush immediately (no delay) to stay inside Chrome's gesture window
                this._flushGestureRetry();
            };
            ['pointerdown','keydown','touchstart','click'].forEach(ev =>
                document.addEventListener(ev, handler, true)
            );
            console.log('[pfVoice] Waiting for user interaction to retry blocked speech…');
        },

        _flushGestureRetry() {
            if (!this._pendingGestureRetry.length) return;
            console.log('[pfVoice] Gesture detected — flushing ' + this._pendingGestureRetry.length + ' blocked utterance(s)');
            const items = this._pendingGestureRetry.slice();
            this._pendingGestureRetry = [];
            items.forEach(it => this._queue.push(it));
            this._processQueue();
        },

        _showBlockedHint() {
            if (this._hintShown) return;
            if (document.getElementById('pf-voice-hint')) return;
            this._hintShown = true;

            const hint = document.createElement('div');
            hint.id = 'pf-voice-hint';
            hint.innerHTML = '<i class="fas fa-volume-up" style="margin-right:8px;"></i>Tap anywhere to hear the announcement';
            hint.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #FFD700, #DAA520);
                color: #0a0a0f;
                padding: 12px 24px;
                border-radius: 30px;
                font-size: 0.85rem;
                font-weight: 700;
                z-index: 99998;
                box-shadow: 0 8px 30px rgba(255, 215, 0, 0.55), 0 4px 12px rgba(0, 0, 0, 0.4);
                pointer-events: none;
                animation: pfHintPulse 1.6s ease-in-out infinite;
                font-family: 'Space Grotesk', sans-serif;
                max-width: 90vw;
                text-align: center;
                line-height: 1.3;
            `;
            if (!document.getElementById('pf-hint-styles')) {
                const s = document.createElement('style');
                s.id = 'pf-hint-styles';
                s.textContent = '@keyframes pfHintPulse { 0%,100% { transform: translateX(-50%) scale(1); opacity: 1; } 50% { transform: translateX(-50%) scale(1.06); opacity: 0.85; } }';
                document.head.appendChild(s);
            }
            document.body.appendChild(hint);
            setTimeout(() => this._removeBlockedHint(), 20000);
        },

        _removeBlockedHint() {
            const hint = document.getElementById('pf-voice-hint');
            if (hint) hint.remove();
        },

        stop() {
            if (this._supported) {
                try { window.speechSynthesis.cancel(); } catch(e) {}
            }
            this._queue = [];
            this._busy = false;
            this._currentUtterance = null;
            window._pfCurrentUtterance = null;
            // speakNow() interrupts — clear pending retries from a PRIOR utterance
            // (new speakNow will queue its own fresh retries if blocked)
            this._pendingGestureRetry = [];
        },

        isSpeaking() {
            try {
                return window.speechSynthesis.speaking
                    || window.speechSynthesis.pending
                    || this._busy
                    || this._queue.length > 0
                    || this._pendingGestureRetry.length > 0;
            } catch(e) { return false; }
        }
    };
    window.pfVoice = VoiceAnnouncer;
    VoiceAnnouncer.init();

    window.pfTestVoice = function(msg) {
        const text = msg || 'This is a test of the PANAFEST 2027 voice system.';
        console.log('[pfVoice] Test text:', text);
        console.log('[pfVoice] Voices available:', (window.speechSynthesis.getVoices() || []).map(v => `${v.name} [${v.lang}]`));
        VoiceAnnouncer.speakNow(text, { rate: 0.92 });
    };
    window.pfDiagnose = function() {
        return {
            supported: VoiceAnnouncer._supported,
            voiceEnabled: Prefs.voiceEnabled(),
            voicesReady: VoiceAnnouncer._voicesReady,
            voiceCount: VoiceAnnouncer._voiceList.length,
            voices: VoiceAnnouncer._voiceList.map(v => `${v.name} [${v.lang}]`),
            currentState: {
                speaking: window.speechSynthesis.speaking,
                pending: window.speechSynthesis.pending,
                paused: window.speechSynthesis.paused,
                busy: VoiceAnnouncer._busy,
                queueLength: VoiceAnnouncer._queue.length,
                pendingGestureRetries: VoiceAnnouncer._pendingGestureRetry.length,
                hasUserGesture: VoiceAnnouncer._hasUserGesture
            },
            lastError: VoiceAnnouncer._lastError
        };
    };

    /* ---------------------------------------------------------
       3. GESTURE UNLOCK
       --------------------------------------------------------- */
    let audioUnlockedOnce = false;
    let deferredVoiceQueue = [];

    function deferredSpeak(text, opts) {
        if (audioUnlockedOnce) { VoiceAnnouncer.speak(text, opts); }
        else { deferredVoiceQueue.push({ text, opts }); }
    }

    function flushDeferredVoice() {
        if (!deferredVoiceQueue.length) return;
        const items = deferredVoiceQueue.slice();
        deferredVoiceQueue = [];
        items.forEach(it => VoiceAnnouncer.speak(it.text, it.opts));
    }

    function unlockAudioOnce() {
        SoundEngine.unlock();
        VoiceAnnouncer.init();
        VoiceAnnouncer._hasUserGesture = true;
        if (audioUnlockedOnce) return;
        audioUnlockedOnce = true;
        ['pointerdown','keydown','touchstart','click'].forEach(ev =>
            document.removeEventListener(ev, unlockAudioOnce, true)
        );
        setTimeout(() => { tryWelcomeVoice('gesture'); }, 150);
        setTimeout(flushDeferredVoice, 250);
    }
    ['pointerdown','keydown','touchstart','click'].forEach(ev =>
        document.addEventListener(ev, unlockAudioOnce, true)
    );

    /* ---------------------------------------------------------
       4. HOOK pfNotify → SOUND
       --------------------------------------------------------- */
    if (typeof window.pfNotify === 'function' && !window.pfNotify.__soundHookedV2) {
        const origPfNotify = window.pfNotify;
        window.pfNotify = function(title, message, type, duration) {
            try { SoundEngine.play(type || 'info'); } catch(e) {}
            return origPfNotify.apply(this, arguments);
        };
        window.pfNotify.__soundHookedV2 = true;
    }

    /* ---------------------------------------------------------
       5. WELCOME & LOGIN VOICE
       --------------------------------------------------------- */
    const WELCOME_TEXT =
        'Welcome to PANAFEST 2027. ' +
        'Please sign up. or. login if you already have an account.';

    let welcomeConfirmed = false;
    let welcomeAttemptedLoad = false;

    function tryWelcomeVoice(source) {
        if (welcomeConfirmed) return;

        const authModal = document.getElementById('authModal');
        const appContent = document.getElementById('appContent');
        if (!authModal || !appContent) return;
        if (appContent.style.display === 'block') return;
        if (authModal.style.display === 'none') return;

        if (source === 'load' && welcomeAttemptedLoad) return;
        if (source === 'load') welcomeAttemptedLoad = true;

        if (source === 'gesture' && VoiceAnnouncer.isSpeaking()) {
            welcomeConfirmed = true;
            return;
        }

        console.log('[pfVoice] Attempting welcome announcement (' + source + ')');
        VoiceAnnouncer.speak(WELCOME_TEXT, { rate: 0.9, maxChunk: 180 });

        setTimeout(() => {
            if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
                welcomeConfirmed = true;
                console.log('[pfVoice] Welcome confirmed playing');
            } else if (VoiceAnnouncer._pendingGestureRetry.length > 0) {
                console.log('[pfVoice] Welcome blocked by autoplay policy — will play on first gesture');
            } else {
                console.log('[pfVoice] Welcome failed at ' + source + ' — will retry');
            }
        }, 900);
    }

    const LOGIN_GREETING_PARTS = (name) => [
        `Welcome to PANAFEST 2027, ${name}!`,
        `We are delighted to have you join this celebration of African heritage, culture, history, and unity.`,
        `Please select one of the modules below to begin your journey and enjoy the full PANAFEST 2027 experience.`
    ];

    let lastGreetedName = null;

    function tryLoginVoice() {
        const appContent = document.getElementById('appContent');
        const currentUserEl = document.getElementById('currentUser');
        if (!appContent || !currentUserEl) return;
        if (appContent.style.display !== 'block') return;

        const name = (currentUserEl.textContent || '').trim();
        if (!name || name === 'Loading...' || name === 'User') return;
        if (name === lastGreetedName) return;

        lastGreetedName = name;
        console.log('[pfVoice] Speaking login greeting for:', name);

        setTimeout(() => {
            VoiceAnnouncer.speakNow(LOGIN_GREETING_PARTS(name)[0], { rate: 0.92, maxChunk: 180 });
            VoiceAnnouncer.speak(LOGIN_GREETING_PARTS(name)[1], { rate: 0.92, maxChunk: 180 });
            VoiceAnnouncer.speak(LOGIN_GREETING_PARTS(name)[2], { rate: 0.92, maxChunk: 180 });
        }, 500);
    }

    /* ---------------------------------------------------------
       6. Boot listeners
       --------------------------------------------------------- */
    function bootVoice() {
        setTimeout(() => tryWelcomeVoice('load'), 700);
        setTimeout(() => tryWelcomeVoice('load'), 2200);

        const appContent = document.getElementById('appContent');
        const currentUserEl = document.getElementById('currentUser');

        if (appContent) {
            let wasVisible = appContent.style.display === 'block';
            new MutationObserver(() => {
                const visible = appContent.style.display === 'block';
                if (visible && !wasVisible) {
                    setTimeout(tryLoginVoice, 400);
                }
                wasVisible = visible;
            }).observe(appContent, { attributes: true, attributeFilter: ['style'] });
        }
        if (currentUserEl) {
            new MutationObserver(() => setTimeout(tryLoginVoice, 150))
                .observe(currentUserEl, { childList: true, characterData: true, subtree: true });
        }

        setTimeout(() => {
            if (appContent && appContent.style.display === 'block') {
                tryLoginVoice();
            }
        }, 1400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootVoice);
    } else {
        bootVoice();
    }

    /* ---------------------------------------------------------
       7. iOS-STYLE BADGE SYSTEM (unchanged)
       --------------------------------------------------------- */
    if (!document.getElementById('pf-badge-styles')) {
        const s = document.createElement('style');
        s.id = 'pf-badge-styles';
        s.textContent = `
            .menu-card { position: relative; }
            .pf-module-badge {
                position: absolute;
                top: 6px; right: 6px;
                min-width: 22px; height: 22px;
                border-radius: 11px;
                background: linear-gradient(135deg, #ff3b30, #d70015);
                color: #ffffff;
                font-size: 0.68rem;
                font-weight: 800;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 6px;
                box-shadow: 0 2px 8px rgba(255,59,48,0.55), 0 0 0 2px rgba(20,20,28,0.85);
                z-index: 10;
                pointer-events: none;
                transform: scale(0);
                opacity: 0;
                transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease;
                letter-spacing: 0.2px;
                line-height: 1;
            }
            body.light-mode .pf-module-badge {
                box-shadow: 0 2px 8px rgba(255,59,48,0.55), 0 0 0 2px rgba(255,255,255,0.9);
            }
            .pf-module-badge.pf-badge-visible { transform: scale(1); opacity: 1; }
            .pf-module-badge.pf-badge-pulse { animation: pfBadgePulse 0.5s cubic-bezier(0.34,1.56,0.64,1); }
            @keyframes pfBadgePulse { 0% { transform: scale(1); } 50% { transform: scale(1.35); } 100% { transform: scale(1); } }
            @media (max-width: 768px) {
                .pf-module-badge {
                    min-width: 18px; height: 18px;
                    font-size: 0.6rem;
                    top: 4px; right: 4px;
                    border-radius: 9px;
                    padding: 0 5px;
                }
            }
        `;
        document.head.appendChild(s);
    }

    const BadgeSystem = {
        _storageKey: 'panafest_badges',
        _seenKey: 'panafest_badges_seen',
        _badges: {},
        _lastSoundAt: {},
        _persistentModules: new Set([
            'diasporaModule', 'adminAccommodationModule', 'adminMarketplaceModule',
            'adminComplaintsModule', 'adminDiasporaHubModule'
        ]),
        _silentForBadgeSound: new Set([
            'programs','events','tickets','bookings','products','feedback','donations'
        ]),
        _userId() { return (window.AUTH && window.AUTH.current && window.AUTH.current.id) || 'guest'; },
        _load() { try { const raw = localStorage.getItem(this._storageKey + '_' + this._userId()); this._badges = raw ? JSON.parse(raw) : {}; } catch(e) { this._badges = {}; } },
        _save() { try { localStorage.setItem(this._storageKey + '_' + this._userId(), JSON.stringify(this._badges)); } catch(e) {} },
        _getSeen() { try { const raw = localStorage.getItem(this._seenKey + '_' + this._userId()); return raw ? JSON.parse(raw) : {}; } catch(e) { return {}; } },
        _saveSeen(seen) { try { localStorage.setItem(this._seenKey + '_' + this._userId(), JSON.stringify(seen)); } catch(e) {} },
        _createdAt(item) { return new Date(item.createdAt || item.updatedAt || item.issuedAt || item.submittedAt || 0).getTime(); },
        _countNew(arr, after) { if (!Array.isArray(arr)) return 0; let n = 0; for (const it of arr) { if (this._createdAt(it) > (after || 0)) n++; } return n; },
        computeAll() {
            const seen = this._getSeen();
            const badges = {};
            const auth = window.AUTH;
            const DB = window.DB || {};
            const user = auth && auth.current;
            const userId = user && user.id;
            const isAdmin = user && user.role === 'admin';

            if (user && !isAdmin) {
                badges.programsModule = this._countNew(DB.programs, seen.programsModule || 0);
                badges.eventScheduleModule = this._countNew(DB.events, seen.eventScheduleModule || 0);
                badges.marketplaceModule = (DB.products || []).filter(p => p.status === 'approved' && p.sellerId !== userId && this._createdAt(p) > (seen.marketplaceModule || 0)).length;
                badges.ticketingModule = (DB.tickets || []).filter(t => t.userId === userId && this._createdAt(t) > (seen.ticketingModule || 0)).length;
                badges.accommodationModule = (DB.bookings || []).filter(b => b.userId === userId && this._createdAt(b) > (seen.accommodationModule || 0)).length;
                const unreadMsgs = (DB.diasporaMessages || []).filter(m => m.toUserId === userId && !(m.readBy || []).includes(userId)).length;
                const unreadNotifs = (DB.diasporaNotifications || []).filter(n => n.userId === userId && !n.read).length;
                badges.diasporaModule = unreadMsgs + unreadNotifs;
                badges.feedbackModule = (DB.feedback || []).filter(f => f.userId === userId && this._createdAt(f) > (seen.feedbackModule || 0)).length;
                badges.directoryModule = this._countNew(DB.directory, seen.directoryModule || 0);
                badges.heritageModule = this._countNew(DB.heritage, seen.heritageModule || 0);
                badges.mediaCenterModule = this._countNew(DB.media, seen.mediaCenterModule || 0);
            }

            if (user && isAdmin) {
                badges.adminUsersModule = (DB.users || []).filter(u => u.role !== 'admin' && this._createdAt(u) > (seen.adminUsersModule || 0)).length;
                badges.adminProgramsModule = (DB.programRegistrations || []).filter(r => this._createdAt(r) > (seen.adminProgramsModule || 0)).length;
                badges.adminTicketsModule = (DB.transactions || []).filter(t => this._createdAt(t) > (seen.adminTicketsModule || 0)).length;
                badges.adminEventScheduleModule = (DB.events || []).filter(e => this._createdAt(e) > (seen.adminEventScheduleModule || 0)).length;
                badges.adminAccommodationModule = (DB.bookings || []).filter(b => b.status === 'pending').length;
                badges.adminMarketplaceModule = (DB.products || []).filter(p => p.status === 'pending').length;
                badges.adminComplaintsModule = (DB.feedback || []).filter(c => (c.overallStatus || c.status || 'pending') === 'pending').length;
                badges.adminDiasporaHubModule = (DB.diasporaReports || []).filter(r => r.status !== 'resolved').length;
            }

            Object.keys(badges).forEach(k => { if (!badges[k] || badges[k] <= 0) delete badges[k]; });
            this._badges = badges;
            this._save();
            return badges;
        },
        render() {
            const cards = document.querySelectorAll('.menu-card[data-module]');
            cards.forEach(card => {
                const moduleId = card.dataset.module;
                const count = this._badges[moduleId] || 0;
                let el = card.querySelector('.pf-module-badge');
                if (count > 0) {
                    const text = count > 99 ? '99+' : String(count);
                    const wasHidden = !el || !el.classList.contains('pf-badge-visible');
                    if (!el) { el = document.createElement('span'); el.className = 'pf-module-badge'; card.appendChild(el); }
                    el.textContent = text;
                    requestAnimationFrame(() => {
                        el.classList.add('pf-badge-visible');
                        if (wasHidden) { el.classList.add('pf-badge-pulse'); setTimeout(() => el.classList.remove('pf-badge-pulse'), 550); }
                    });
                } else if (el) {
                    el.classList.remove('pf-badge-visible');
                    setTimeout(() => { if (!el.classList.contains('pf-badge-visible')) el.remove(); }, 420);
                }
            });
        },
        markSeen(moduleId) {
            if (this._persistentModules.has(moduleId)) return;
            const seen = this._getSeen();
            seen[moduleId] = Date.now();
            this._saveSeen(seen);
            delete this._badges[moduleId];
            this._save();
            this.render();
        },
        notifyUpdate(moduleId, collection) {
            this.computeAll();
            this.render();
            if (!this._silentForBadgeSound.has(collection)) {
                const now = Date.now();
                if (!this._lastSoundAt[moduleId] || now - this._lastSoundAt[moduleId] > 2200) {
                    this._lastSoundAt[moduleId] = now;
                    try { SoundEngine.play('badge'); } catch(e) {}
                }
            }
            const moduleEl = document.getElementById(moduleId);
            const container = document.getElementById('moduleContainer');
            if (moduleEl && container && container.style.display === 'block' && moduleEl.style.display === 'block' && !this._persistentModules.has(moduleId)) {
                setTimeout(() => this.markSeen(moduleId), 600);
            }
        },
        init() { this._load(); this.computeAll(); this.render(); }
    };
    window.pfBadges = BadgeSystem;

    if (typeof window.navigateToModule === 'function' && !window.navigateToModule.__badgesWrappedV2) {
        const origNav = window.navigateToModule;
        window.navigateToModule = function(moduleId) {
            const r = origNav.apply(this, arguments);
            try { BadgeSystem.markSeen(moduleId); } catch(e) {}
            return r;
        };
        window.navigateToModule.__badgesWrappedV2 = true;
    }

    if (window.DB && typeof window.DB.save === 'function' && !window.DB.save.__badgesWrappedV2) {
        const origSave = window.DB.save.bind(window.DB);
        const moduleMap = {
            programs: ['programsModule','adminProgramsModule'],
            events: ['eventScheduleModule','adminEventScheduleModule'],
            tickets: ['ticketingModule','adminTicketsModule'],
            bookings: ['accommodationModule','adminAccommodationModule'],
            products: ['marketplaceModule','adminMarketplaceModule'],
            feedback: ['feedbackModule','adminComplaintsModule'],
            users: ['adminUsersModule'],
            transactions: ['adminTicketsModule'],
            programRegistrations: ['adminProgramsModule'],
            diasporaMessages: ['diasporaModule'],
            diasporaNotifications: ['diasporaModule'],
            diasporaReports: ['adminDiasporaHubModule'],
            directory: ['directoryModule'],
            heritage: ['heritageModule'],
            media: ['mediaCenterModule']
        };
        window.DB.save = function(collection) {
            const result = origSave(collection);
            const mods = moduleMap[collection];
            if (mods && window.AUTH && window.AUTH.current) {
                const isAdmin = window.AUTH.current.role === 'admin';
                mods.filter(m => isAdmin ? m.startsWith('admin') : !m.startsWith('admin'))
                    .forEach(m => { try { BadgeSystem.notifyUpdate(m, collection); } catch(e) {} });
            }
            return result;
        };
        window.DB.save.__badgesWrappedV2 = true;
    }

    (function watchMenuGrid(){
        const grid = document.getElementById('menuGrid');
        if (!grid) { setTimeout(watchMenuGrid, 400); return; }
        new MutationObserver(() => { setTimeout(() => { try { BadgeSystem.init(); } catch(e) {} }, 120); })
            .observe(grid, { childList: true });
    })();

    (function watchAppEntry(){
        const appContent = document.getElementById('appContent');
        if (!appContent) { setTimeout(watchAppEntry, 400); return; }
        new MutationObserver(() => {
            if (appContent.style.display === 'block') {
                setTimeout(() => { try { BadgeSystem.init(); } catch(e) {} }, 350);
            }
        }).observe(appContent, { attributes: true, attributeFilter: ['style'] });
    })();

    setTimeout(() => { try { BadgeSystem.init(); } catch(e) {} }, 900);

    console.log('[PANAFEST 2027] Sound engine, voice announcer & iOS badge system v3 loaded.');

    /* ============================================================
   PANAFEST 2027 — MODULE CARD 3D TILT ENHANCEMENT (v2)
   Self-contained cosmetic layer. Does not touch any existing
   functions, variables, auth, DB, or app logic. Safe to remove.
   - Cursor-tracked tilt + spotlight coordinates
   - Pointer press-state (spring snap)
   - Haptic feedback on tap (Android; ignored on iOS)
   - Auto-rebinds when renderMenuGrid() rebuilds cards
   ============================================================ */
(function pfModuleCardTilt() {
    'use strict';

    // Respect user preferences — silently disable on reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Skip 3D tilt on touch-only devices (hover: none)
    // Mobile still gets the CSS press lift + haptic below.
    const isTouchOnly = window.matchMedia('(hover: none)').matches;
    const supportsHaptic = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

    const bound = new WeakSet();
    let raf = null;

    function bindCard(card) {
        if (bound.has(card)) return;
        bound.add(card);

        // -------- 3D tilt (desktop pointer) --------
        if (!isTouchOnly) {
            let pendingX = 50, pendingY = 50, active = false;

            const apply = () => {
                raf = null;
                if (!active) return;
                // Map cursor position (0–100%) to tilt degrees (±8)
                const rx = -((pendingY - 50) / 50) * 8;
                const ry =  ((pendingX - 50) / 50) * 8;
                card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
                card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
                card.style.setProperty('--mx', pendingX + '%');
                card.style.setProperty('--my', pendingY + '%');
            };

            card.addEventListener('pointerenter', () => {
                active = true;
                card.style.setProperty('--ty', '-10px');
                card.style.setProperty('--sc', '1.03');
            });

            card.addEventListener('pointermove', (e) => {
                if (!active) return;
                const r = card.getBoundingClientRect();
                pendingX = ((e.clientX - r.left) / r.width) * 100;
                pendingY = ((e.clientY - r.top)  / r.height) * 100;
                if (raf == null) raf = requestAnimationFrame(apply);
            });

            card.addEventListener('pointerleave', () => {
                active = false;
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
                card.style.setProperty('--ty', '0px');
                card.style.setProperty('--sc', '1');
                card.style.setProperty('--mx', '50%');
                card.style.setProperty('--my', '50%');
            });
        }

        // -------- Press state (both touch & pointer) --------
        card.addEventListener('pointerdown', () => {
            card.style.setProperty('--sc', '0.97');
            card.style.setProperty('--ty', '0px');
            if (supportsHaptic) {
                try { navigator.vibrate(10); } catch (_) { /* ignore */ }
            }
        });

        card.addEventListener('pointerup', () => {
            // Only "spring back" to hover pose if pointer is still over the card
            if (card.matches(':hover') && !isTouchOnly) {
                card.style.setProperty('--sc', '1.03');
                card.style.setProperty('--ty', '-10px');
            } else {
                card.style.setProperty('--sc', '1');
                card.style.setProperty('--ty', '0px');
            }
        });

        card.addEventListener('pointercancel', () => {
            card.style.setProperty('--sc', '1');
            card.style.setProperty('--ty', '0px');
        });
    }

    function scan() {
        document.querySelectorAll('.menu-card').forEach(bindCard);
    }

    // -------- Attach after renderMenuGrid() creates cards --------
    function attachObserver() {
        const grid = document.getElementById('menuGrid');
        if (!grid) {
            setTimeout(attachObserver, 300);
            return;
        }
        // Re-bind whenever the grid's children are replaced
        // (happens on login, logout, and role switch)
        new MutationObserver(scan).observe(grid, { childList: true });
        scan();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachObserver);
    } else {
        attachObserver();
    }

    // Safety net: user can hot-swap between light/dark while hovering
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) scan();
    });

    console.log('[PANAFEST 2027] Module card 3D tilt layer v2 loaded.');
    /* ============================================================
   PANAFEST 2027 — VOICE PRONUNCIATION FIX
   ------------------------------------------------------------
   Problem : TTS engines spell "PANAFEST" as P-A-N-A-F-E-S-T
             because it is an unknown word in ALL CAPS.

   Fix     : Transparently wrap pfVoice.speak / pfVoice.speakNow
             with a phonetic pre-processor. The UI text is NOT
             changed; only the text handed to the SpeechSynthesis
             engine is respelled as "Panna-fest".

   Safety  : No existing function, variable, or logic is modified.
             Since window.pfVoice === VoiceAnnouncer (same object),
             wrapping the public methods also covers the internal
             tryWelcomeVoice / tryLoginVoice calls.

   Diagnostics: pfTestPanafest() — speaks a demo sentence.
   ============================================================ */
(function patchPanafestPronunciation() {
    'use strict';

    /* ---------- Phonetic replacement table ---------- */
    /* Order matters: longer / more specific patterns first.     */
    const PHONETIC_MAP = [
        /* The brand name — plural/possessive forms first */
        [/\bPANAFEST'?S\b/gi, "Panna-fest's"],
        [/\bPANAFEST\b/gi,    'Panna-fest'],

        /* Other acronyms that commonly get spelled out */
        [/\bGHS\b/g,    'Ghana cedis'],
        [/\bUSD\b/g,    'U S dollars'],
        [/\bUCC\b/g,    'U C C'],
        [/\bMTN\b/g,    'M T N'],
        [/\bVIP\b/g,    'V I P'],
        [/\bQR\b/g,     'Q R'],
        [/\bSMS\b/g,    'S M S'],
        [/\bAPI\b/g,    'A P I'],
        [/\bURL\b/g,    'U R L'],
        [/\bPDF\b/g,    'P D F'],
        [/\bID\b/g,     'I D'],
    ];

    function phoneticizeForSpeech(text) {
        if (text == null) return text;
        let out = String(text);
        for (const [pattern, replacement] of PHONETIC_MAP) {
            out = out.replace(pattern, replacement);
        }
        return out;
    }

    /* ---------- Install the wrapper ---------- */
    function install() {
        if (!window.pfVoice) return false;
        if (window.pfVoice.__pfPronunciationPatched) return true;
        window.pfVoice.__pfPronunciationPatched = true;

        ['speak', 'speakNow'].forEach(method => {
            const original = window.pfVoice[method];
            if (typeof original !== 'function') return;
            if (original.__pfPhoneticWrapped) return;

            const wrapped = function (text, opts) {
                /* Replace brand/acronyms → phonetic spelling,
                   then hand off to the untouched original. */
                return original.call(this, phoneticizeForSpeech(text), opts);
            };
            wrapped.__pfPhoneticWrapped = true;
            window.pfVoice[method] = wrapped;
        });

        /* ---------- Diagnostic tool ---------- */
        window.pfTestPanafest = function () {
            window.pfVoice.speakNow(
                'Welcome to PANAFEST 2027. ' +
                'PANAFEST is the Pan African Historical Theatre Festival.',
                { rate: 0.9 }
            );
        };

        console.log(
            '[pfVoice] Pronunciation patch active — ' +
            '"PANAFEST" will be spoken as "Panna-fest". ' +
            'Run pfTestPanafest() in the console to verify.'
        );
        return true;
    }

    /* pfVoice may not be attached yet during initial load — poll */
    if (install()) return;
    let tries = 0;
    const timer = setInterval(() => {
        if (install() || ++tries > 60) clearInterval(timer);
    }, 200);
    /* ============================================================
   PANAFEST 2027 — MODERN CLICK SOUND ENGINE (v5)
   ------------------------------------------------------------
   Adds a satisfying, premium two-tone click (C6 + G6 shimmer)
   whenever the user interacts with a module card, button, tab,
   or interactive tile.

   Features:
     • Respects  `panafest_sound_enabled`  (via pfToggleSound)
     • Shares the existing  pfSound  AudioContext when available
     • Delegated listener survives every re-render
     • Skips text inputs / textareas / selects (no sound on focus)
     • Debounced (30 ms) to prevent machine-gun retriggering
     • Capture-phase so the sound fires before navigation
     • Exposed as  window.pfPlayClick()  for manual use
     • Safe to remove — no existing function or state is touched
   ============================================================ */
(function pfClickSoundEngine() {
    'use strict';

    /* ---------- Preference gate ---------- */
    const soundEnabled = () =>
        localStorage.getItem('panafest_sound_enabled') !== 'false';

    /* ---------- Engine ---------- */
    const ClickEngine = {
        _ctx: null,
        _last: 0,

        _ensureCtx() {
            // Reuse pfSound's context when available (single AudioContext)
            if (window.pfSound && window.pfSound._ctx) {
                this._ctx = window.pfSound._ctx;
            }
            if (!this._ctx) {
                try {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (AC) this._ctx = new AC();
                } catch (_) { /* silent fail */ }
            }
        },

        _fireTwoTone() {
            if (!this._ctx) return;
            // Premium click:
            //   • primary : C6 (1046.5 Hz), 75 ms, gain 0.060
            //   • shimmer : G6 (1567.98 Hz), 85 ms, gain 0.038, +12 ms
            this._tone(1046.50, 0,     0.075, 0.060, 'sine');
            this._tone(1567.98, 0.012, 0.085, 0.038, 'sine');
        },

        _tone(freq, offset, dur, vol, type) {
            if (!this._ctx) return;
            const t = this._ctx.currentTime + offset;
            const osc = this._ctx.createOscillator();
            const gain = this._ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(vol, t + 0.006);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            osc.connect(gain);
            gain.connect(this._ctx.destination);
            osc.start(t);
            osc.stop(t + dur + 0.02);
        },

        playClick() {
            if (!soundEnabled()) return;
            const now = performance.now();
            if (now - this._last < 30) return;   // debounce
            this._last = now;

            this._ensureCtx();
            if (!this._ctx) return;

            // If context suspended (autoplay policy), resume then fire
            if (this._ctx.state !== 'running') {
                this._ctx.resume()
                    .then(() => this._fireTwoTone())
                    .catch(() => {});
            } else {
                this._fireTwoTone();
            }
        }
    };

    // Public API (for manual triggering from anywhere)
    window.pfPlayClick = () => ClickEngine.playClick();

    /* ---------- Delegate click listener ---------- */
    // Everything that should produce a satisfying click sound
    const CLICKABLE = [
        '.menu-card',
        'button',
        '.auth-btn',
        '.action-btn',
        '.back-to-menu-btn',
        '.mp-tab',
        '.drawer-menu-item',
        '.hub-tab',
        '.user-mgmt-tab',
        '.media-tab',
        '.diaspora-tab',
        '.complaints-tab-btn',
        '.student-complaints-tab-btn',
        '.category-icon',
        '.mp-product-card',
        '.program-card',
        '.accom-card',
        '.vendor-card',
        '.directory-card',
        '.media-card',
        '.ticket-type-card',
        '.schedule-event-item',
        '.hub-action-btn',
        '.hub-stat-card',
        '.hub-chapter-card',
        '.delete-history-btn',
        '.pf-notif-close',
        '.menu-drawer-btn',
        '.close-drawer-btn',
        '.hub-forum-actions button',
        '.mm-option',
        'a[href]'
    ].join(', ');

    // Text-entry controls should NOT produce a click sound
    const SKIP = [
        'input[type="text"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="number"]',
        'input[type="password"]',
        'input[type="date"]',
        'input[type="datetime-local"]',
        'input[type="search"]',
        'input[type="url"]',
        'input[type="file"]',
        'textarea',
        'select'
    ].join(', ');

    document.addEventListener('click', (e) => {
        if (!(e.target instanceof Element)) return;
        if (e.target.closest(SKIP)) return;

        const hit = e.target.closest(CLICKABLE);
        if (!hit) return;
        if (hit.matches('[disabled], [aria-disabled="true"]')) return;

        ClickEngine.playClick();
    }, true); // capture phase — sound fires before any navigation

    /* ---------- Pre-unlock AudioContext on first gesture ---------- */
    function unlockOnce() {
        ClickEngine._ensureCtx();
        if (ClickEngine._ctx && ClickEngine._ctx.state === 'suspended') {
            ClickEngine._ctx.resume().catch(() => {});
        }
        ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
            document.removeEventListener(ev, unlockOnce, true));
    }
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
        document.addEventListener(ev, unlockOnce, true));

    console.log('[PANAFEST 2027] Modern click sound engine loaded — pfPlayClick() available.');
})();
})();
})();
})();

/* ============================================================
   PANAFEST 2027 — CUSTOMER INTERFACE FIXES v6 (standalone)
   ------------------------------------------------------------
   - Sound: provides its own click handler because the original
     pfClickSoundEngine is orphaned by an early `return` inside
     patchPanafestPronunciation and NEVER executes.
   - Slideshow: injects 3 background banners beneath .menu-grid
     on mobile; crossfades every 5 s; desktop untouched.
   - Bright text + light-mode 3D are handled in styles.css; a
     JS fallback ensures they apply even if CSS didn't append.
   Non-invasive. Idempotent. Logs its own boot to console.
   ============================================================ */
(function PF_V6_CustomerFixes(){
    'use strict';
    console.log('%c[PF v6] BOOT — customer fixes loading', 'color:#FFD700;font-weight:bold');

    /* -------------------------------------------------------
       A. Click sound (standalone — does NOT rely on the
          orphaned pfClickSoundEngine)
       ------------------------------------------------------- */
    let AC_CTX = null;
    let LAST = 0;

    function ac() {
        if (window.pfSound && window.pfSound._ctx && window.pfSound._ctx.state !== 'closed') {
            AC_CTX = window.pfSound._ctx;
            return AC_CTX;
        }
        if (AC_CTX && AC_CTX.state !== 'closed') return AC_CTX;
        try {
            const Ctor = window.AudioContext || window.webkitAudioContext;
            if (Ctor) AC_CTX = new Ctor();
        } catch(e) { console.warn('[PF v6] AudioContext create failed:', e); }
        return AC_CTX;
    }

    function tone(ctx, freq, offset, dur, vol, type) {
        const t = ctx.currentTime + offset;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type || 'triangle';
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + dur + 0.03);
    }

    function playClick() {
        if (localStorage.getItem('panafest_sound_enabled') === 'false') return;
        const now = performance.now();
        if (now - LAST < 40) return;
        LAST = now;
        const ctx = ac();
        if (!ctx) return;
        const fire = () => {
            try {
                tone(ctx,  880.00, 0.000, 0.08, 0.30);   /* A5 punch — loud */
                tone(ctx, 1320.00, 0.015, 0.10, 0.22);   /* E6 body  */
            } catch(e) { console.warn('[PF v6] tone err:', e); }
        };
        if (ctx.state === 'running') fire();
        else ctx.resume().then(fire).catch(() => fire());
    }

    /* Override ALL public hooks so anything else calling them gets
       the loud version, not the orphaned quiet one */
    window.pfPlayClick = playClick;
    if (window.pfSound) {
        const origPlay = window.pfSound.play?.bind(window.pfSound);
        window.pfSound.play = function(kind) {
            if (kind === 'badge' || kind === 'success' || kind === 'gold' || kind === 'error') {
                return origPlay ? origPlay(kind) : undefined;
            }
            playClick();
        };
    }

    /* Unlock AudioContext on first gesture */
    const UNLOCK_EVTS = ['pointerdown','touchstart','mousedown','keydown'];
    function unlock() {
        const ctx = ac();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().then(() => console.log('[PF v6] AudioContext running'))
                       .catch(e => console.warn('[PF v6] Unlock fail:', e));
        }
        UNLOCK_EVTS.forEach(ev => document.removeEventListener(ev, unlock, true));
    }
    UNLOCK_EVTS.forEach(ev => document.addEventListener(ev, unlock, true));

    /* Capture-phase delegated click → sound */
    const SKIP = 'input[type="text"],input[type="email"],input[type="tel"],input[type="number"],input[type="password"],input[type="date"],input[type="datetime-local"],input[type="search"],input[type="url"],input[type="file"],textarea,select';
    const HIT  = ['button','.menu-card','.auth-btn','.action-btn','.back-to-menu-btn',
                  '.mp-tab','.mp-product-card','.program-card','.accom-card','.vendor-card',
                  '.directory-card','.media-card','.ticket-type-card','.schedule-event-item',
                  '.hub-tab','.hub-action-btn','.hub-stat-card','.hub-chapter-card',
                  '.user-mgmt-tab','.media-tab','.diaspora-tab','.complaints-tab-btn',
                  '.student-complaints-tab-btn','.category-icon','.pf-notif-close',
                  '.menu-drawer-btn','.close-drawer-btn','.mm-option','.delete-history-btn',
                  '.drawer-menu-item','a[href]'].join(',');

    document.addEventListener('click', function(e){
        const t = e.target;
        if (!(t instanceof Element)) return;
        if (t.closest(SKIP)) return;
        const hit = t.closest(HIT);
        if (!hit) return;
        if (hit.matches('[disabled],[aria-disabled="true"]')) return;
        playClick();
    }, true);

    /* Console test */
    window.pfSoundTest = function(){
        console.log('[PF v6] pfSoundTest() — state:', ac()?.state);
        const ctx = ac();
        if (!ctx) { console.warn('[PF v6] No AudioContext'); return; }
        if (ctx.state === 'suspended') {
            ctx.resume().then(playClick).catch(e => console.warn('[PF v6] Test resume fail:', e));
        } else {
            playClick();
        }
    };

    console.log('[PF v6] ✓ Click sound installed. Run pfSoundTest() to verify.');

    /* -------------------------------------------------------
       B. Mobile slideshow banners under module card
       ------------------------------------------------------- */
    const BANNERS = ['banner1.jpg', 'banner2.jpg', 'banner3.jpg'];
    const MS = 5000;
    let ROT = null;
    let STACK = null;

    function isMobile() { return window.matchMedia('(max-width: 768px)').matches; }

    function buildSlides() {
        const page = document.getElementById('menuPage');
        if (!page) return;
        if (!isMobile()) {
            if (STACK && STACK.parentNode) STACK.parentNode.removeChild(STACK);
            STACK = null;
            if (ROT) { clearInterval(ROT); ROT = null; }
            return;
        }
        if (STACK && STACK.parentNode === page) return; /* already built */

        const old = page.querySelector('.pf-menu-slides-bg');
        if (old) old.remove();

        STACK = document.createElement('div');
        STACK.className = 'pf-menu-slides-bg';
        STACK.setAttribute('aria-hidden', 'true');

        BANNERS.forEach((src, i) => {
            const s = document.createElement('div');
            s.className = 'pf-menu-slide' + (i === 0 ? ' pf-active' : '');
            s.style.backgroundImage = "url('" + src + "')";
            STACK.appendChild(s);
        });

        page.insertBefore(STACK, page.firstChild);

        const slides = STACK.querySelectorAll('.pf-menu-slide');
        let idx = 0;
        if (ROT) clearInterval(ROT);
        ROT = setInterval(() => {
            if (!STACK || !STACK.parentNode || !isMobile()) return;
            slides[idx].classList.remove('pf-active');
            idx = (idx + 1) % slides.length;
            slides[idx].classList.add('pf-active');
        }, MS);

        console.log('[PF v6] ✓ Mobile slideshow built — ' + slides.length + ' slides, rotating every ' + MS + 'ms');
    }

    function scheduleBuild() { setTimeout(buildSlides, 250); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleBuild);
    } else {
        scheduleBuild();
    }

    let rT = null;
    window.addEventListener('resize', () => {
        clearTimeout(rT);
        rT = setTimeout(buildSlides, 250);
    });

    const page = document.getElementById('menuPage');
    if (page) {
        new MutationObserver(() => {
            clearTimeout(rT);
            rT = setTimeout(buildSlides, 200);
        }).observe(page, { attributes: true, attributeFilter: ['style'] });
    }

    /* -------------------------------------------------------
       C. Bright-text + strong light-mode 3D fallback
          (ensures styles apply even if styles.css append failed)
       ------------------------------------------------------- */
    if (!document.getElementById('pf-v6-styles')) {
        const s = document.createElement('style');
        s.id = 'pf-v6-styles';
        s.textContent = `
            /* Bright module text — dark mode */
            body:not(.light-mode) .menu-card h3 {
                color:#fff !important; -webkit-text-fill-color:#fff !important;
                font-weight:800 !important;
                text-shadow:0 2px 8px rgba(0,0,0,.95),0 1px 3px rgba(0,0,0,.85),0 0 22px rgba(0,0,0,.55) !important;
            }
            body:not(.light-mode) .menu-card p {
                color:#ececf4 !important; -webkit-text-fill-color:#ececf4 !important;
                font-weight:600 !important;
                text-shadow:0 1px 4px rgba(0,0,0,.9),0 1px 2px rgba(0,0,0,.8) !important;
            }
            /* Bright module text — light mode */
            body.light-mode .menu-card h3 {
                color:#000 !important; -webkit-text-fill-color:#000 !important;
                font-weight:800 !important;
                text-shadow:0 1px 0 rgba(255,255,255,.95),0 1px 2px rgba(0,0,0,.1) !important;
            }
            body.light-mode .menu-card p {
                color:#1a1a2e !important; -webkit-text-fill-color:#1a1a2e !important;
                font-weight:700 !important;
                text-shadow:0 1px 0 rgba(255,255,255,.85),0 1px 2px rgba(0,0,0,.08) !important;
            }
            /* Strong light-mode 3D */
            body.light-mode .menu-card {
                box-shadow:
                    0 26px 52px rgba(0,0,0,.3),
                    0 16px 32px rgba(0,0,0,.22),
                    0 8px 16px rgba(0,0,0,.15),
                    0 3px 6px rgba(0,0,0,.1),
                    inset 0 2px 0 rgba(255,255,255,1),
                    inset 0 3px 6px rgba(255,255,255,.85),
                    inset 0 4px 10px rgba(var(--module-accent-rgb,255,215,0),.22),
                    inset 0 -2px 0 rgba(0,0,0,.35),
                    inset 0 -5px 16px rgba(0,0,0,.18),
                    inset 2px 0 3px rgba(255,255,255,.7),
                    inset -2px 0 3px rgba(0,0,0,.14) !important;
            }
            body.light-mode .menu-card:hover {
                box-shadow:
                    0 38px 76px rgba(0,0,0,.36),
                    0 22px 44px rgba(0,0,0,.26),
                    0 10px 20px rgba(0,0,0,.18),
                    0 50px 100px rgba(var(--module-accent-rgb,255,215,0),.45),
                    0 0 130px rgba(var(--module-accent-rgb,255,215,0),.22),
                    inset 0 2px 0 rgba(255,255,255,1),
                    inset 0 3px 8px rgba(255,255,255,.95),
                    inset 0 5px 14px rgba(var(--module-accent-rgb,255,215,0),.36),
                    inset 0 -2px 0 rgba(0,0,0,.3),
                    inset 0 -5px 16px rgba(0,0,0,.16) !important;
            }
            body.light-mode .menu-card:active {
                box-shadow:
                    0 3px 6px rgba(0,0,0,.16),
                    0 1px 3px rgba(0,0,0,.12),
                    inset 0 -2px 0 rgba(255,255,255,.98),
                    inset 0 -3px 6px rgba(var(--module-accent-rgb,255,215,0),.35),
                    inset 0 2px 0 rgba(0,0,0,.35),
                    inset 0 6px 18px rgba(0,0,0,.32),
                    inset 0 3px 10px rgba(0,0,0,.22) !important;
            }
            /* Mobile slideshow CSS */
            @media (max-width:768px) {
                #menuPage.menu-page { isolation:isolate; }
                #menuPage.menu-page .pf-menu-slides-bg {
                    position:absolute; inset:0; overflow:hidden;
                    border-radius:inherit; z-index:0; pointer-events:none;
                }
                #menuPage.menu-page .pf-menu-slide {
                    position:absolute; inset:0;
                    background-size:cover; background-position:center;
                    opacity:0; transition:opacity 1.8s ease-in-out;
                }
                #menuPage.menu-page .pf-menu-slide.pf-active { opacity:1; }
                #menuPage.menu-page .pf-menu-slides-bg::after {
                    content:''; position:absolute; inset:0;
                    background:linear-gradient(180deg,rgba(10,10,15,.55) 0%,rgba(10,10,15,.82) 55%,rgba(10,10,15,.92) 100%);
                    z-index:2; pointer-events:none;
                }
                body.light-mode #menuPage.menu-page .pf-menu-slides-bg::after {
                    background:linear-gradient(180deg,rgba(250,245,232,.55) 0%,rgba(245,240,228,.76) 55%,rgba(240,235,224,.86) 100%);
                }
                #menuPage.menu-page::before { z-index:3 !important; }
                #menuPage.menu-page > .menu-grid { z-index:4 !important; position:relative; }
            }
        `;
        document.head.appendChild(s);
        console.log('[PF v6] ✓ Bright text + strong 3D + slideshow CSS injected.');
    }

    /* -------------------------------------------------------
       D. Diagnostic
       ------------------------------------------------------- */
    window.pfDiagnose = function(){
        console.table({
            mobileViewport:        window.matchMedia('(max-width:768px)').matches,
            menuPageExists:        !!document.getElementById('menuPage'),
            slideshowStackExists:  !!document.querySelector('.pf-menu-slides-bg'),
            slidesCount:           document.querySelectorAll('.pf-menu-slide').length,
            activeSlide:           document.querySelectorAll('.pf-menu-slide.pf-active').length,
            audioCtxState:         (window.pfSound && window.pfSound._ctx && window.pfSound._ctx.state) || 'none',
            soundPref:             localStorage.getItem('panafest_sound_enabled') || 'unset (default=enabled)'
        });
    };

    console.log('%c[PF v6] ✓ READY — run pfDiagnose() or pfSoundTest() in console', 'color:#4ade80;font-weight:bold');
})();
