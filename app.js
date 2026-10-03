const navbar=document.querySelector('.navbar');
if(navbar && !window.matchMedia('(max-width: 820px)').matches){
  window.addEventListener('scroll',()=>{navbar.style.background=window.scrollY>40?'rgba(246,245,240,.98)':'rgba(246,245,240,.96)'},{passive:true});
}

const menuToggle=document.querySelector('.mobile-menu-toggle');
const mainNavigation=document.getElementById('site-navigation');
if(menuToggle && mainNavigation){
  menuToggle.addEventListener('click',()=>{
    const isOpen=menuToggle.getAttribute('aria-expanded')==='true';
    menuToggle.setAttribute('aria-expanded',String(!isOpen));
    menuToggle.textContent=isOpen?'Menu':'Close';
    mainNavigation.classList.toggle('is-open',!isOpen);
  });
  mainNavigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.textContent='Menu';
    mainNavigation.classList.remove('is-open');
  }));
}

const revealElements=document.querySelectorAll('.section-heading,.expertise-card,.project-card,.project-methodology,.system-type,.technology-group,.training-card,.training-evidence,.simulation-card,.simulation-stats,.simulation-note,.service-banner,.journey-item,.contact-item');
revealElements.forEach(el=>el.classList.add('reveal'));
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.1});
  revealElements.forEach(el=>observer.observe(el));
}else{revealElements.forEach(el=>el.classList.add('visible'))}

const sections=document.querySelectorAll('section[id]');
const navLinks=document.querySelectorAll('.nav-links a');
const homePagePath=new URL('index.html',document.baseURI).pathname;
const isHomePage=window.location.pathname===homePagePath||window.location.pathname==='/'||window.location.pathname.endsWith('/');
function normalizeNavSection(href){
  return new URL(href,document.baseURI).hash;
}
function updateNav(){
  if(!isHomePage){
    navLinks.forEach(link=>link.classList.toggle('active',normalizeNavSection(link.getAttribute('href'))==='#projects'));
    return;
  }
  let current='home';
  sections.forEach(section=>{if(window.scrollY>=section.offsetTop-150)current=section.id});
  navLinks.forEach(link=>link.classList.toggle('active',normalizeNavSection(link.getAttribute('href'))===`#${current}`));
}
if(isHomePage&&sections.length)window.addEventListener('scroll',updateNav,{passive:true});
updateNav();

const modal=document.getElementById('imageModal');
const modalImage=document.getElementById('modalImage');
const modalCaption=document.getElementById('modalCaption');
let modalClose=null;
let activeSimulationCard=null;
const closeModal=()=>{
  if(!modal||!modalImage)return;
  modal.classList.remove('open');modal.setAttribute('aria-hidden','true');modalImage.src='';document.body.style.overflow='';
  if(activeSimulationCard&&activeSimulationCard.isConnected)activeSimulationCard.focus();
  activeSimulationCard=null;
};
if(modal&&modalImage&&modalCaption){
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby',modalCaption.id||'modalCaption');
  modalClose=modal.querySelector('.modal-close');
  if(!modalClose)modal.tabIndex=-1;
  document.querySelectorAll('.simulation-card').forEach(card=>{
    const title=card.querySelector('h3');
    if(!title)return;
    card.setAttribute('role','button');card.tabIndex=0;card.setAttribute('aria-label',title.textContent.trim());
    card.addEventListener('click',()=>{
      const img=card.querySelector('img');
      const category=card.querySelector('.simulation-card-top span');
      if(!img||!category)return;
      activeSimulationCard=card;
      modalImage.src=img.src;modalImage.alt=img.alt;
      modalCaption.textContent=title.textContent+' — '+category.textContent;
      modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
      (modalClose||modal).focus();
    });
    card.addEventListener('keydown',event=>{
      if((event.key==='Enter'||event.key===' ')&&!event.repeat){event.preventDefault();card.click()}
    });
  });
  if(modalClose)modalClose.addEventListener('click',closeModal);
  modal.addEventListener('click',event=>{if(event.target===modal)closeModal()});
  document.addEventListener('keydown',event=>{
    if(!modal.classList.contains('open'))return;
    if(event.key==='Escape'){closeModal();return}
    if(event.key==='Tab'){event.preventDefault();(modalClose||modal).focus()}
  });
}
const yearElement=document.getElementById('year');
if(yearElement)yearElement.textContent=new Date().getFullYear();
