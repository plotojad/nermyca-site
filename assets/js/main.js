const menu=document.querySelector(".menu"),nav=document.querySelector("nav");
menu?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open))});
nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
const els=document.querySelectorAll(".reveal");
if("IntersectionObserver"in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.12});els.forEach(e=>io.observe(e))}
else els.forEach(e=>e.classList.add("visible"));