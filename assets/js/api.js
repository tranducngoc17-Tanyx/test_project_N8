/**
 * UniCareer API adapter.
 * SRS_UniCare.docx quy định REST API nhưng KHÔNG quy định endpoint cụ thể.
 * MODE = 'mock' để chạy độc lập; chuyển thành 'api' khi Backend xác nhận contract.
 * Không dùng dữ liệu localStorage/mock làm xác thực hoặc phân quyền thật.
 */
export const APP_CONFIG = Object.freeze({
  MODE: 'mock', // 'mock' | 'api'
  API_BASE_URL: 'http://127.0.0.1:8000',
  API_PREFIX: '/api', // chỉnh theo router FastAPI của nhóm
  PAGE_SIZE: 6,
  STORAGE_PREFIX: 'unicareer_fe_demo_v1'
});

export const STATUS_LABELS = Object.freeze({
  RECEIVED: 'Đã tiếp nhận', REVIEWING: 'Đang xem xét',
  ACCEPTED: 'Đã chấp nhận', REJECTED: 'Đã từ chối'
});
export const TYPE_LABELS = Object.freeze({
  INTERNSHIP: 'Thực tập', PART_TIME: 'Bán thời gian', FULL_TIME: 'Toàn thời gian'
});
const key = suffix => `${APP_CONFIG.STORAGE_PREFIX}_${suffix}`;
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const dateOffset = (days) => {
  const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const clean = str => String(str ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
const baseJobs = [
  [101,'Thực tập sinh Backend Python','TechNova','TP. Hồ Chí Minh','3 - 5 triệu','INTERNSHIP','Không yêu cầu','Python, FastAPI, MySQL',34],
  [102,'Frontend Developer Intern','BluePeak Digital','TP. Hồ Chí Minh','4 - 6 triệu','INTERNSHIP','Không yêu cầu','HTML, CSS, JavaScript',37],
  [103,'Data Analyst Intern','NextStep Labs','Hà Nội','5 - 7 triệu','INTERNSHIP','Không yêu cầu','SQL, Excel, Python',27],
  [104,'Thực tập sinh QA Tester','Brightsoft','Đà Nẵng','3 - 4 triệu','INTERNSHIP','Không yêu cầu','Testing, API, Postman',25],
  [105,'UI/UX Design Intern','Mosaic Studio','TP. Hồ Chí Minh','Thỏa thuận','INTERNSHIP','Không yêu cầu','Figma, Prototype, Design',41],
  [106,'Full-stack Developer Junior','CloudNest','Hà Nội','12 - 18 triệu','FULL_TIME','Dưới 1 năm','JavaScript, Python, SQL',50],
  [107,'Thực tập sinh Business Analyst','Prism Solutions','TP. Hồ Chí Minh','4 - 5 triệu','INTERNSHIP','Không yêu cầu','UML, SQL, Documentation',38],
  [108,'Chuyên viên hỗ trợ kỹ thuật','NovaCare','Đà Nẵng','7 - 10 triệu','FULL_TIME','Dưới 1 năm','Networking, SQL, Support',44],
  [109,'Thực tập sinh DevOps','Orbit Tech','Hà Nội','5 - 8 triệu','INTERNSHIP','Không yêu cầu','Linux, Docker, Git',31],
  [110,'Cộng tác viên Content Marketing','HelloWork Studio','Làm việc từ xa','Thỏa thuận','PART_TIME','Không yêu cầu','SEO, Viết nội dung, Marketing',33],
  [111,'Junior Mobile Flutter Developer','PixelWave','TP. Hồ Chí Minh','10 - 15 triệu','FULL_TIME','1–2 năm','Flutter, Dart, REST API',46],
  [112,'Thực tập sinh Database Developer','ByteWorks','Hà Nội','4 - 6 triệu','INTERNSHIP','Không yêu cầu','MySQL, SQL, Python',29],
  [113,'Product Operations Part-time','FieldLab','Làm việc từ xa','6 - 8 triệu','PART_TIME','Không yêu cầu','Excel, SQL, Giao tiếp',53],
  [114,'Backend Engineer','Internal Example','TP. Hồ Chí Minh','15 - 22 triệu','FULL_TIME','1–2 năm','Python, FastAPI, MySQL',-3],
  [115,'Frontend Intern (chờ duyệt)','Internal Example','Hà Nội','3 - 5 triệu','INTERNSHIP','Không yêu cầu','HTML, CSS',29]
];
const mockJobs = baseJobs.map(([job_id,title,company_name,location,salary_range,job_type,experience_level,skillsString,deadlineDays]) => {
  // Kept as individually named fields for straightforward mapping to JOB_POSTS.
  const job = {job_id, company_id: job_id, company_name,
    title, location, salary_range, job_type, experience_level,
    skills:skillsString.split(',').map(s=>s.trim()),
    deadline:dateOffset(deadlineDays), status:'ACTIVE', approval_status:'APPROVED',
    created_at:dateOffset(-1 - (job_id - 101))};
  job.description = `Cùng ${company_name} phát triển các sản phẩm và quy trình chuyên nghiệp.\nTham gia các nhiệm vụ thực tế phù hợp với vị trí ${job.title}.\nPhối hợp cùng nhóm để hoàn thành công việc đúng tiến độ.\nĐược hướng dẫn, nhận phản hồi và trau dồi kỹ năng.`;
  job.requirements = `Có kiến thức nền tảng về ${job.skills.join(', ')}.\nCó tinh thần trách nhiệm, chủ động học hỏi và khả năng làm việc nhóm.\nƯu tiên sinh viên hoặc người mới đi làm có dự án thực tế.`;
  job.benefits = 'Môi trường học tập năng động và có người hướng dẫn.\nTham gia dự án thực tế, phát triển kỹ năng chuyên môn.\nChế độ hỗ trợ theo nội dung tuyển dụng.';
  job.company_description = `${company_name} là doanh nghiệp giả lập dùng cho bản demo frontend UniCareer.`;
  return job;
});
// Không để hiển thị tin chờ duyệt hoặc đã đóng trong danh sách công khai.
mockJobs.find(j=>j.job_id===114).status='CLOSED';
mockJobs.find(j=>j.job_id===115).approval_status='PENDING';

export class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.name='ApiError'; this.status=status; }
}

function readJSON(name, fallback) {
  try { const value=localStorage.getItem(key(name)); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}
function writeJSON(name, value) {
  try { localStorage.setItem(key(name),JSON.stringify(value)); }
  catch { throw new ApiError('Không thể lưu dữ liệu trình duyệt. Hãy kiểm tra chế độ riêng tư hoặc bộ nhớ.'); }
}
const DEFAULT_PROFILE = Object.freeze({
  candidate_id:1, full_name:'Nguyễn Minh Anh', email:'minhanh@student.example',
  phone:'0900 123 456', university:'Đại học Công nghệ', major:'Công nghệ thông tin',
  skills:'Python, FastAPI, MySQL', bio:'Sinh viên yêu thích phát triển ứng dụng web.', cv_text:'', cv_filename:''
});
function baseURL(path) { return `${APP_CONFIG.API_BASE_URL.replace(/\/$/,'')}${APP_CONFIG.API_PREFIX}${path}`; }
async function request(path, {method='GET', data=null, multipart=false}={}) {
  const token = sessionStorage.getItem('unicareer_access_token');
  const headers={Accept:'application/json', ...(token?{Authorization:`Bearer ${token}`}:{})};
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),15000);
  try {
    let body;
    if(data!==null){ if(multipart){body=data;}else{headers['Content-Type']='application/json';body=JSON.stringify(data);} }
    const res=await fetch(baseURL(path),{method,headers,body,signal:controller.signal});
    let payload=null;
    try { payload=await res.json(); } catch { /* 204 or non-JSON response */ }
    if(!res.ok){
      let error = payload?.detail || payload?.message || `Yêu cầu thất bại (HTTP ${res.status}).`;
      if(Array.isArray(error))error=error.map(e=>e.msg).join('; ');
      throw new ApiError(String(error),res.status);
    }
    return payload;
  } catch(err){
    if(err.name==='AbortError') throw new ApiError('Máy chủ phản hồi quá lâu. Vui lòng thử lại.');
    if(err instanceof ApiError)throw err;
    throw new ApiError('Không kết nối được FastAPI. Kiểm tra API_BASE_URL, CORS và máy chủ.');
  } finally {clearTimeout(timeout);}
}
const isPublic = (j) => j.status==='ACTIVE' && j.approval_status==='APPROVED' && (!j.deadline || j.deadline>=today());
const getSalaryNums = s => (String(s||'').match(/\d+(?:[.,]\d+)?/g)||[]).map(n=>Number(n.replace(',','.')));
function salaryMatches(salary, filter) {
  if(!filter)return true;
  if(filter==='negotiable')return clean(salary).includes('thoa thuan');
  const nums = getSalaryNums(salary); if(nums.length===0)return false;
  const low=nums[0], high=nums[1]??nums[0];
  if(filter==='under5')return low<5;
  if(filter==='5to10')return high>=5 && low<=10;
  if(filter==='over10')return high>10;
  return true;
}
const normalizeJob = j => ({...j,job_id:j.job_id??j.id,company_name:j.company_name??j.company?.company_name??j.company?.name??'Doanh nghiệp',skills:Array.isArray(j.skills)?j.skills:[]});

export const api = {
  async listJobs({q='',location='',type='',salary='',experience='',sort='newest',page=1,pageSize=APP_CONFIG.PAGE_SIZE}={}){
    let jobs;
    if(APP_CONFIG.MODE==='mock') {
      jobs=mockJobs.filter(isPublic);
    } else {
      // Contract dự kiến: GET /api/jobs; đổi endpoint & field theo Backend thực tế.
      // Giai đoạn tích hợp MVP: endpoint cần trả về danh sách để lọc/phân trang ở FE.
      // Nếu Backend dùng server-side pagination, sửa logic này theo response metadata.
      const result=await request('/jobs');
      jobs=(Array.isArray(result)?result:(result?.items??result?.results??result?.jobs??result?.data??[])).map(normalizeJob).filter(isPublic);
      // Nếu API đã phân trang phía server, cần thống nhất total/pages với Backend.
    }
    const query=clean(q);
    jobs=jobs.filter(j=>!query||clean([j.title,j.company_name,j.description,...(j.skills||[])].join(' ')).includes(query));
    jobs=jobs.filter(j=>!location||clean(j.location).includes(clean(location)));
    jobs=jobs.filter(j=>!type||j.job_type===type);
    jobs=jobs.filter(j=>salaryMatches(j.salary_range,salary));
    jobs=jobs.filter(j=>!experience||clean(j.experience_level).includes(clean(experience)));
    jobs=[...jobs].sort((a,b)=>{
      if(sort==='deadline')return a.deadline.localeCompare(b.deadline);
      if(sort==='salary')return (getSalaryNums(b.salary_range)[0]??0)-(getSalaryNums(a.salary_range)[0]??0);
      return b.created_at.localeCompare(a.created_at);
    });
    const total=jobs.length;
    const totalPages=Math.max(1,Math.ceil(total/pageSize));
    const safePage=Math.min(Math.max(1,Number(page)||1),totalPages);
    return {items:jobs.slice((safePage-1)*pageSize,safePage*pageSize),total,totalPages,page:safePage};
  },
  async getJob(jobId){
    if(APP_CONFIG.MODE==='mock'){
      const j=mockJobs.find(x=>String(x.job_id)===String(jobId));
      if(!j)throw new ApiError('Không tìm thấy công việc.',404);
      return {...j};
    }
    return normalizeJob(await request(`/jobs/${encodeURIComponent(jobId)}`));
  },
  async getProfile(){
    if(APP_CONFIG.MODE==='mock')return {...DEFAULT_PROFILE,...readJSON('profile',{})};
    return await request('/candidate/profile');
  },
  async saveProfile(profile){
    if(APP_CONFIG.MODE==='mock'){
      const next={...DEFAULT_PROFILE,...readJSON('profile',{}),...profile};writeJSON('profile',next);return next;
    }
    return request('/candidate/profile',{method:'PUT',data:profile});
  },
  async listApplications(){
    if(APP_CONFIG.MODE==='mock')return readJSON('applications',[]);
    const result=await request('/candidate/applications');
    return Array.isArray(result)?result:(result?.items??result?.applications??[]);
  },
  async submitApplication({jobId,coverLetter='',cvFile=null}){
    if(APP_CONFIG.MODE==='mock'){
      const job=await this.getJob(jobId);
      if(!isPublic(job))throw new ApiError('Tin không còn mở hoặc chưa được kiểm duyệt.',400);
      const apps=await this.listApplications();
      if(apps.some(a=>String(a.job_id)===String(jobId)))throw new ApiError('Bạn đã ứng tuyển vào công việc này.',409);
      const application={application_id:Date.now(),job_id:Number(jobId),job_title:job.title,company_name:job.company_name,
        candidate_id:1,status:'RECEIVED',applied_at:new Date().toISOString(),cover_letter:coverLetter.trim(),
        cv_filename:cvFile?.name??'',note:'Chỉ lưu tên tệp CV trong mock; không tải nội dung tệp lên máy chủ.'};
      writeJSON('applications',[application,...apps]);return application;
    }
    // Trường hợp CV: gửi multipart. Cần đổi tên field theo endpoint FastAPI thực tế.
    if(cvFile){const data=new FormData();data.append('job_id',String(jobId));data.append('cover_letter',coverLetter);data.append('cv',cvFile);return request('/applications',{method:'POST',data,multipart:true});}
    return request('/applications',{method:'POST',data:{job_id:Number(jobId),cover_letter:coverLetter}});
  }
};
