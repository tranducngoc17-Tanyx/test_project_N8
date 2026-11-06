/** UniCareer Candidate UI (ES Module, no dependencies).
 * Sprint tasks: list jobs, search/filter, job details, apply job.
 * Additional support: applications history and minimal CV/profile demo.
 */
import { api, APP_CONFIG, ApiError, STATUS_LABELS, TYPE_LABELS } from './api.js';

const $ = (selector, root=document) => root.querySelector(selector);
const esc = (value='') => String(value ?? '').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const params = () => new URL(window.location.href).searchParams;
const jobIdFromURL = () => params().get('id');
const jobLink = id => `job-detail.html?id=${encodeURIComponent(id)}`;
const applyLink = id => `apply-job.html?id=${encodeURIComponent(id)}`;
const fmtDate = date => {
  if(!date)return 'Chưa cập nhật';
  const d=new Date(String(date).slice(0,10)+'T12:00:00');
  return Number.isNaN(d.getTime())?'Chưa cập nhật':new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
};
const fmtDateTime = date => date ? new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(date)) : '—';
function todayLocal(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
const jobAvailable = job => job.status==='ACTIVE' && job.approval_status==='APPROVED' && (!job.deadline||job.deadline>=todayLocal());
const short = (val, len=95) => String(val||'').length>len ? String(val).slice(0,len)+'…':String(val||'');
function icon(name){
  const paths={
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    'map-pin':'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    wallet:'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 10h18M6 6V4h13"/>',
    briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',
    sliders:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="white"/><circle cx="15" cy="17" r="2" fill="white"/>',
    upload:'<path d="M12 16V3m-5 5 5-5 5 5"/><path d="M4 17v3h16v-3"/>',
    check:'<path d="m4 12 5 5L20 6"/>',
    alert:'<circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 17h.01"/>',
    menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
    building:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 21v-5h6v5M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.briefcase}</svg>`;
}
function replaceIcons(root=document){root.querySelectorAll('[data-icon]').forEach(node=>{node.innerHTML=icon(node.dataset.icon);});}
function renderLayout(){
  const page=document.body.dataset.page;
  $('#site-header').innerHTML=`<header class="site-header"><div class="container nav-wrap">
    <a class="brand" href="index.html" aria-label="UniCareer - Việc làm"><span class="brand-mark" style="position:relative">U</span>UniCareer</a>
    <nav class="nav-main" id="nav-main" aria-label="Điều hướng chính">
      <a href="index.html" class="${['jobs','detail','apply'].includes(page)?'is-active':''}">Khám phá việc làm</a>
      <a href="my-applications.html" class="${page==='applications'?'is-active':''}">Đơn ứng tuyển</a>
      <a href="cv-manage.html" class="${page==='cv'?'is-active':''}">Hồ sơ & CV</a>
    </nav>
    <div class="nav-side">${APP_CONFIG.MODE==='mock'?'<span class="demo-label" title="Dữ liệu demo lưu trong trình duyệt">DEMO DATA</span>':''}<span class="avatar" title="Sinh viên mẫu">SV</span><button type="button" class="nav-menu-btn" id="nav-menu-btn" aria-label="Mở menu" aria-controls="nav-main" aria-expanded="false">${icon('menu')}</button></div>
  </div></header>`;
  $('#site-footer').innerHTML=`<footer class="site-footer"><div class="container footer-layout"><div><strong>UniCareer</strong><p>Nền tảng kết nối việc làm và định hướng nghề nghiệp cho sinh viên.</p></div><div class="footer-links"><a href="index.html">Việc làm</a><a href="my-applications.html">Ứng tuyển</a><a href="cv-manage.html">Hồ sơ CV</a></div></div></footer>`;
  $('#nav-menu-btn')?.addEventListener('click',()=>{
    const nav=$('#nav-main'), btn=$('#nav-menu-btn'); const expanded=nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded',String(expanded));btn.setAttribute('aria-label',expanded?'Đóng menu':'Mở menu');
  });
  replaceIcons();
}
let toastTimer=0;
function toast(message, isError=false){
  const el=$('#toast'); if(!el)return;
  el.textContent=message;el.className='toast is-show'+(isError?' error':'');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.className='toast'},4400);
}
function displayError(mount, message){
  mount.innerHTML=`<div class="card error-panel"><div class="empty-icon" style="margin:0 auto 14px;color:var(--danger)">${icon('alert')}</div><h1>Không thể hiển thị dữ liệu</h1><p>${esc(message)}</p><button class="btn btn-outline" type="button" id="retry-request">Tải lại trang</button></div>`;
  $('#retry-request',mount)?.addEventListener('click',()=>window.location.reload());
}
function logoText(company){return String(company||'DN').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase();}
const colors=['','--green','--purple','--orange'];
function logo(company,id){return `<span class="company-logo company-logo${colors[Number(id)%colors.length]||''}" aria-hidden="true">${esc(logoText(company))}</span>`;}
function status(status){
  const normalized=String(status||'RECEIVED').toUpperCase();
  return `<span class="status status--${esc(normalized.toLowerCase())}">${esc(STATUS_LABELS[normalized]||normalized)}</span>`;
}
function jobCard(job){
  const skills=(job.skills||[]).slice(0,3).map(k=>`<span class="tag">${esc(k)}</span>`).join('');
  return `<article class="job-card card">
    ${logo(job.company_name,job.job_id)}
    <div><p class="company-name">${esc(job.company_name)}</p><h3><a href="${jobLink(job.job_id)}">${esc(job.title)}</a></h3>
      <div class="job-meta"><span>${icon('map-pin')}${esc(job.location||'Chưa cập nhật')}</span><span>${icon('wallet')}${esc(job.salary_range||'Thỏa thuận')}</span><span>${icon('briefcase')}${esc(TYPE_LABELS[job.job_type]||job.job_type)}</span></div>
      <div class="job-tags"><span class="tag tag--blue">${esc(job.experience_level||'Không yêu cầu')}</span>${skills}</div>
    </div>
    <div class="job-actions"><a class="btn btn-outline" href="${jobLink(job.job_id)}">Xem chi tiết ${icon('arrow')}</a><span class="deadline">Hạn nộp: ${esc(fmtDate(job.deadline))}</span></div>
  </article>`;
}
function parseJobSearch(){const p=params();return {q:p.get('q')||'',location:p.get('location')||'',type:p.get('type')||'',salary:p.get('salary')||'',experience:p.get('experience')||'',sort:p.get('sort')||'newest',page:Math.max(1,parseInt(p.get('page')||'1',10)||1)};}
function writeJobSearch(obj){const url=new URL(location.href);for(const [key,value] of Object.entries(obj)){if(value&&value!=='newest'&&(key!=='page'||Number(value)>1))url.searchParams.set(key,String(value));else url.searchParams.delete(key);}history.replaceState(null,'',url);}
let requestNum=0;
async function initJobs(){
  const fields=['q','location','type','salary','experience','sort'];
  const values=()=>Object.fromEntries(fields.map(k=>[k,$(`#${k}`)?.value||'']));
  const restore=()=>{const q=parseJobSearch();fields.forEach(k=>{if($(`#${k}`))$(`#${k}`).value=q[k]||'';});return q;};
  let state=restore();
  async function refresh(page=1){
    state={...values(),page};writeJobSearch(state);
    const counter=++requestNum;
    const mount=$('#job-results');mount.setAttribute('aria-busy','true');mount.innerHTML='<div class="loading">Đang tìm các công việc phù hợp...</div>';
    try{
      const result=await api.listJobs(state);
      if(counter!==requestNum)return;
      state.page=result.page;writeJobSearch(state);
      $('#result-count').textContent=`${result.total} công việc phù hợp`;
      $('#search-description').textContent=state.q?`Kết quả cho “${short(state.q,55)}”`:'Danh sách tin tuyển dụng còn hiệu lực';
      mount.innerHTML=result.items.length?result.items.map(jobCard).join(''):`<div class="empty-state"><div class="empty-icon">${icon('search')}</div><h3>Chưa tìm thấy công việc phù hợp</h3><p>Thử thay đổi từ khóa, địa điểm hoặc chọn các bộ lọc khác.</p><button id="empty-reset" class="btn btn-outline" type="button">Xóa bộ lọc</button></div>`;
      $('#empty-reset')?.addEventListener('click',clearAll);
      const nav=$('#pagination');nav.innerHTML='';
      if(result.totalPages>1){
        const list=[['‹',Math.max(1,result.page-1)],...Array.from({length:result.totalPages},(_,i)=>[i+1,i+1]),['›',Math.min(result.totalPages,result.page+1)]];
        nav.innerHTML=list.map(([label,n],i)=>`<button type="button" class="page-btn ${n===result.page && i>0&&i<list.length-1?'is-active':''}" data-page-number="${n}" ${((i===0&&result.page===1)||(i===list.length-1&&result.page===result.totalPages))?'disabled':''} aria-label="${typeof label==='number'?`Trang ${label}`:(i===0?'Trang trước':'Trang sau')}">${label}</button>`).join('');
        nav.querySelectorAll('[data-page-number]').forEach(btn=>btn.addEventListener('click',()=>{refresh(Number(btn.dataset.pageNumber));window.scrollTo({top:Math.max(0,$('.jobs-area').offsetTop-80),behavior:'smooth'});}));
      }
    }catch(err){if(counter!==requestNum)return;$('#result-count').textContent='Không thể tải việc làm';displayError(mount,err.message);$('#pagination').innerHTML='';}
    finally{if(counter===requestNum)mount.setAttribute('aria-busy','false');}
  }
  function clearAll(){clearTimeout(debounce);fields.forEach(k=>{if($(`#${k}`))$(`#${k}`).value=k==='sort'?'newest':'';});refresh(1);}
  $('#hero-search').addEventListener('submit',e=>{e.preventDefault();refresh(1);$('.jobs-area').scrollIntoView({behavior:'smooth'});});
  ['location','type','salary','experience','sort'].forEach(k=>$(`#${k}`)?.addEventListener('change',()=>refresh(1)));
  $('#clear-filters').addEventListener('click',clearAll);
  $('#show-filters')?.addEventListener('click',()=>{const isOpen=$('#filter-panel').classList.toggle('is-open');$('#show-filters').setAttribute('aria-expanded',String(isOpen));});
  // Tìm sau khi gõ 350ms, không gửi liên tục từng ký tự.
  let debounce;$('#q').addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(()=>refresh(1),350);});
  window.addEventListener('popstate',()=>{const q=restore();refresh(q.page);});
  await refresh(state.page);
}
function lines(raw){return String(raw||'Chưa cập nhật').split(/\r?\n/).filter(Boolean).map(x=>`<div>${esc(x)}</div>`).join('');}
async function initDetail(){
  const mount=$('#detail-view');const jobId=jobIdFromURL();
  if(!jobId){displayError(mount,'Đường dẫn thiếu mã công việc (id).');return;}
  try{
    const job=await api.getJob(jobId);
    let apps=[];try{apps=await api.listApplications();}catch{/* Detail is public even if applications need authentication */}
    const unavailable=!jobAvailable(job);const alreadyApplied=apps.some(a=>String(a.job_id)===String(job.job_id));
    const button=unavailable?`<button class="btn btn-lg" disabled>Đã đóng / hết hạn ứng tuyển</button>`:
      alreadyApplied?`<a class="btn btn-outline btn-lg" href="my-applications.html">✓ Xem đơn đã ứng tuyển</a>`:`<a class="btn btn-lg" href="${applyLink(job.job_id)}">${icon('file')} Ứng tuyển ngay ${icon('arrow')}</a>`;
    document.title=`${job.title} | UniCareer`;
    mount.innerHTML=`<div class="content-grid"><div>
      <section class="detail-header card"><div class="job-header-main">${logo(job.company_name,job.job_id)}<div><p class="company-name">${esc(job.company_name)}</p><h1>${esc(job.title)}</h1>${unavailable?'<span class="status status--rejected">Không còn nhận đơn</span>':'<span class="status status--success">Đang tuyển</span>'}</div></div>
        <div class="detail-info"><span class="info-pill">${icon('map-pin')}${esc(job.location||'Không xác định')}</span><span class="info-pill">${icon('wallet')}${esc(job.salary_range||'Thỏa thuận')}</span><span class="info-pill">${icon('briefcase')}${esc(TYPE_LABELS[job.job_type]||job.job_type)}</span><span class="info-pill">${icon('calendar')}Hạn nộp: ${esc(fmtDate(job.deadline))}</span></div>
        <div class="detail-actions">${button}<a class="btn btn-outline" href="index.html">${icon('arrow')} Xem thêm việc làm</a></div>
      </section>
      <section class="detail-content card"><h2>Mô tả công việc</h2><div class="prose">${lines(job.description)}</div></section>
      <section class="detail-content card"><h2>Yêu cầu ứng viên</h2><div class="prose">${lines(job.requirements)}</div>${job.skills?.length?`<div class="job-tags" style="margin-top:17px">${job.skills.map(x=>`<span class="tag tag--blue">${esc(x)}</span>`).join('')}</div>`:''}</section>
      ${job.benefits?`<section class="detail-content card"><h2>Quyền lợi</h2><div class="prose">${lines(job.benefits)}</div></section>`:''}
    </div><aside class="detail-sidebar">
      <div class="card"><h3>Thông tin tuyển dụng</h3><ul class="aside-list"><li><span>Hình thức</span><strong>${esc(TYPE_LABELS[job.job_type]||job.job_type)}</strong></li><li><span>Kinh nghiệm</span><strong>${esc(job.experience_level||'Không yêu cầu')}</strong></li><li><span>Mức lương</span><strong>${esc(job.salary_range||'Thỏa thuận')}</strong></li><li><span>Địa điểm</span><strong>${esc(job.location||'—')}</strong></li><li><span>Hạn ứng tuyển</span><strong>${esc(fmtDate(job.deadline))}</strong></li></ul>${button.replace('btn-lg','btn-full')}</div>
      <div class="card"><h3>Về ${esc(job.company_name)}</h3><p>${esc(job.company_description||'Cập nhật thông tin doanh nghiệp.')}</p><span class="badge-demo">Thông tin minh họa trong chế độ Demo</span></div>
    </aside></div>`;
  }catch(err){displayError(mount,err.message);}
}
async function initApply(){
  const mount=$('#apply-view');const jobId=jobIdFromURL();
  if(!jobId){displayError(mount,'Đường dẫn thiếu mã công việc (id).');return;}
  try{
    const [job,profile,apps]=await Promise.all([api.getJob(jobId),api.getProfile(),api.listApplications()]);
    $('#detail-back-link').href=jobLink(jobId);
    document.title=`Ứng tuyển ${job.title} | UniCareer`;
    if(!jobAvailable(job)){displayError(mount,'Tin tuyển dụng đã đóng, hết hạn hoặc chưa được duyệt. Không thể ứng tuyển.');return;}
    if(apps.some(a=>String(a.job_id)===String(job.job_id))){
      mount.innerHTML=`<section class="card success-panel"><div class="success-icon">${icon('check')}</div><h1>Bạn đã ứng tuyển công việc này</h1><p>UniCareer chỉ cho phép một đơn ứng tuyển trên mỗi tin tuyển dụng.</p><div class="success-actions"><a class="btn" href="my-applications.html">Xem đơn đã ứng tuyển</a><a class="btn btn-outline" href="${jobLink(jobId)}">Về trang chi tiết</a></div></section>`;
      return;
    }
    mount.innerHTML=`<div class="screen-heading" style="margin-bottom:24px"><h1>Ứng tuyển công việc</h1><p>Kiểm tra thông tin trước khi gửi hồ sơ đến nhà tuyển dụng.</p></div>
    <div class="apply-layout"><div class="card form-card"><h2>Thông tin ứng viên</h2><p>Được lấy từ hồ sơ sinh viên của bạn. <a href="cv-manage.html" style="color:var(--blue);font-weight:700">Chỉnh sửa hồ sơ</a></p>
      <div class="profile-summary"><div class="summary-field"><span>Họ và tên</span><strong>${esc(profile.full_name||'Chưa cập nhật')}</strong></div><div class="summary-field"><span>Email</span><strong>${esc(profile.email||'Chưa cập nhật')}</strong></div><div class="summary-field"><span>Trường đại học</span><strong>${esc(profile.university||'Chưa cập nhật')}</strong></div><div class="summary-field"><span>Chuyên ngành</span><strong>${esc(profile.major||'Chưa cập nhật')}</strong></div></div>
      <form id="apply-form" novalidate><h2>Hồ sơ ứng tuyển</h2><p>CV là tùy chọn trong bản demo. Bạn có thể nộp bằng thông tin hồ sơ hiện có.</p>
        <label class="upload-box" for="cv-file">${icon('upload')}<span><strong>Tải CV đính kèm (không bắt buộc)</strong><p>Đề xuất: PDF / DOC / DOCX, tối đa 5MB. Định dạng cuối cùng cần thống nhất với Backend.</p><input id="cv-file" type="file" accept=".pdf,.doc,.docx" aria-describedby="cv-help"><small id="cv-help" class="helper">Trong chế độ Demo chỉ lưu tên tệp, không lưu nội dung.</small></span></label>
        <div class="field"><label for="cover-letter">Thư giới thiệu <span class="muted">(không bắt buộc)</span></label><textarea id="cover-letter" name="cover_letter" maxlength="1000" placeholder="Giới thiệu ngắn về bản thân, kỹ năng và lý do bạn quan tâm vị trí này..."></textarea><small><span id="char-count">0</span> / 1000 ký tự</small></div>
        <label class="checkline"><input id="consent" type="checkbox" required><span>Tôi xác nhận thông tin đã cung cấp là chính xác và đồng ý gửi hồ sơ này đến nhà tuyển dụng.</span></label>
        <div id="form-error" class="form-error hide" role="alert"></div><button id="submit-application" class="btn btn-lg btn-full" type="submit">${icon('arrow')} Gửi đơn ứng tuyển</button>
      </form>
    </div><aside class="detail-sidebar"><div class="card"><h3>Vị trí đang ứng tuyển</h3><p class="company-name">${esc(job.company_name)}</p><h3 style="margin-top:0">${esc(job.title)}</h3><ul class="aside-list"><li><span>Địa điểm</span><strong>${esc(job.location)}</strong></li><li><span>Hình thức</span><strong>${esc(TYPE_LABELS[job.job_type]||job.job_type)}</strong></li><li><span>Hạn nộp</span><strong>${esc(fmtDate(job.deadline))}</strong></li></ul><a class="btn btn-outline btn-full" href="${jobLink(jobId)}">Xem chi tiết công việc</a></div><div class="notice">${icon('alert')}<span>Hệ thống kiểm tra ứng tuyển trùng và tình trạng tin khi bạn gửi đơn. Kết quả được lưu trong mục Đơn ứng tuyển.</span></div></aside></div>`;
    $('#cover-letter').addEventListener('input',e=>{$('#char-count').textContent=e.target.value.length;});
    $('#apply-form').addEventListener('submit',async(e)=>{
      e.preventDefault();const error=$('#form-error');error.classList.add('hide');
      if(!$('#consent').checked){error.textContent='Vui lòng xác nhận thông tin trước khi gửi đơn.';error.classList.remove('hide');return;}
      const file=$('#cv-file').files[0];
      if(file){const allowed=/\.(pdf|doc|docx)$/i.test(file.name);if(!allowed||file.size>5*1024*1024){error.textContent='Vui lòng chọn CV PDF/DOC/DOCX, tối đa 5MB (giới hạn mẫu).';error.classList.remove('hide');return;}}
      const submit=$('#submit-application');submit.disabled=true;submit.textContent='Đang gửi ứng tuyển...';
      try{
        await api.submitApplication({jobId:job.job_id,coverLetter:$('#cover-letter').value,cvFile:file||null});
        mount.innerHTML=`<section class="card success-panel"><div class="success-icon">${icon('check')}</div><h1>Ứng tuyển thành công!</h1><p>Đơn ứng tuyển cho vị trí <strong>${esc(job.title)}</strong> đã được tiếp nhận. Bạn có thể kiểm tra trạng thái trong mục Đơn đã ứng tuyển.</p><div class="success-actions"><a href="my-applications.html" class="btn">Xem đơn ứng tuyển</a><a href="index.html" class="btn btn-outline">Tìm thêm việc làm</a></div></section>`;
        window.scrollTo({top:0,behavior:'smooth'});
      }catch(err){error.textContent=err.message;error.classList.remove('hide');submit.disabled=false;submit.innerHTML=`${icon('arrow')} Gửi đơn ứng tuyển`;}
    });
  }catch(err){displayError(mount,err.message);}
}
async function initApplications(){
  const mount=$('#applications-view');
  try{
    const apps=await api.listApplications();
    mount.innerHTML=apps.length?apps.map(a=>{
      const title=a.job_title||a.job?.title||'Công việc';const firm=a.company_name||a.job?.company_name||'Doanh nghiệp';
      return `<article class="application-card card"><div><h3><a href="${jobLink(a.job_id)}">${esc(title)}</a></h3><p class="muted">${icon('building')} ${esc(firm)}</p><p class="muted">${icon('calendar')} Nộp ngày ${esc(fmtDateTime(a.applied_at))}</p></div><div class="application-right">${status(a.status)}<a class="btn btn-ghost" href="${jobLink(a.job_id)}">Xem việc làm ${icon('arrow')}</a></div></article>`;
    }).join(''):`<div class="empty-state"><div class="empty-icon">${icon('file')}</div><h3>Chưa có đơn ứng tuyển</h3><p>Khám phá cơ hội thực tập và việc làm phù hợp để gửi đơn ứng tuyển đầu tiên.</p><a class="btn" href="index.html">Khám phá việc làm</a></div>`;
  }catch(err){displayError(mount,err.message);}
}
async function initCV(){
  const mount=$('#cv-view');
  try{
    const p=await api.getProfile();
    mount.innerHTML=`<div class="cv-layout"><aside class="card"><div class="mini-profile"><h3>${icon('user')} Hồ sơ ứng viên</h3><p><strong>${esc(p.full_name)}</strong></p><p>${esc(p.email||'')}</p><p>${esc(p.university||'')}</p><p>${esc(p.major||'')}</p></div><div class="notice" style="margin-top:20px">${icon('alert')}<span>Hồ sơ mẫu được lưu trong trình duyệt khi ở chế độ DEMO. Không dùng làm dữ liệu người dùng thật.</span></div></aside>
      <form class="card" id="profile-form" novalidate><h2>Chỉnh sửa thông tin</h2><p>Tham khảo các trường bảng CANDIDATES trong SRS.</p>
        <div class="field"><label for="full-name">Họ và tên *</label><input id="full-name" required maxlength="100" value="${esc(p.full_name)}"></div>
        <div class="field"><label for="profile-phone">Số điện thoại</label><input id="profile-phone" maxlength="20" value="${esc(p.phone||'')}"></div>
        <div class="field"><label for="university">Trường đại học</label><input id="university" maxlength="150" value="${esc(p.university||'')}"></div>
        <div class="field"><label for="major">Chuyên ngành</label><input id="major" maxlength="100" value="${esc(p.major||'')}"></div>
        <div class="field"><label for="skills">Kỹ năng</label><input id="skills" value="${esc(Array.isArray(p.skills)?p.skills.join(', '):p.skills||'')}" placeholder="Python, FastAPI, MySQL"></div>
        <div class="field"><label for="bio">Giới thiệu bản thân</label><textarea id="bio" maxlength="2000" rows="3">${esc(p.bio||'')}</textarea></div>
        <div class="field"><label for="cv-text">Nội dung CV (MVP dạng văn bản)</label><textarea id="cv-text" maxlength="5000" rows="5" placeholder="Học vấn, kinh nghiệm, dự án, kỹ năng...">${esc(p.cv_text||'')}</textarea><small>Chưa có upload file thực tế; trường cv_url phải được Backend hỗ trợ.</small></div>
        <button class="btn btn-lg" type="submit" id="save-profile">Lưu hồ sơ</button>
      </form></div>`;
    $('#profile-form').addEventListener('submit',async e=>{
      e.preventDefault();const fullName=$('#full-name').value.trim();if(!fullName){toast('Bạn cần nhập họ và tên.',true);return;}
      const b=$('#save-profile');b.disabled=true;b.textContent='Đang lưu...';
      try{await api.saveProfile({full_name:fullName,phone:$('#profile-phone').value.trim(),university:$('#university').value.trim(),major:$('#major').value.trim(),skills:$('#skills').value.trim(),bio:$('#bio').value.trim(),cv_text:$('#cv-text').value.trim()});toast('Đã lưu hồ sơ thành công.');}catch(err){toast(err.message,true);}finally{b.disabled=false;b.textContent='Lưu hồ sơ';}
    });
  }catch(err){displayError(mount,err.message);}
}
renderLayout();
const pages={jobs:initJobs,detail:initDetail,apply:initApply,applications:initApplications,cv:initCV};
const init=pages[document.body.dataset.page];
if(init)init().catch(err=>toast(err.message||'Có lỗi ngoài dự kiến.',true));
