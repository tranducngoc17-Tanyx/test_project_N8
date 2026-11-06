/** Smoke tests không cần thư viện ngoài, chạy bằng Node 22+ */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here=path.dirname(fileURLToPath(import.meta.url));
const frontend=path.resolve(here,'..');
const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {api,APP_CONFIG}=await import('../assets/js/api.js');
assert.equal(APP_CONFIG.MODE,'mock','Smoke test chỉ nên chạy ở chế độ mock');

const listed=await api.listJobs({pageSize:100});
assert.ok(listed.total>=10,'Có đủ việc làm demo');
assert.ok(listed.items.every(x=>x.status==='ACTIVE'&&x.approval_status==='APPROVED'),'Chỉ liệt kê tin hợp lệ');
assert.ok(listed.items.every(x=>x.deadline),'Mỗi tin có hạn ứng tuyển');
assert.equal(listed.items.find(x=>x.job_id===101)?.title,'Thực tập sinh Backend Python');
assert.equal(listed.items.find(x=>x.job_id===101)?.company_name,'TechNova');
const searched=await api.listJobs({q:'Python',pageSize:100});
assert.ok(searched.total>0,'Tìm kiếm từ khóa trả kết quả');
const accentless=await api.listJobs({q:'thuc tap sinh',pageSize:100});
assert.ok(accentless.total>0,'Tìm không dấu tiếng Việt');
const internship=await api.listJobs({type:'INTERNSHIP',pageSize:100});
assert.ok(internship.items.every(x=>x.job_type==='INTERNSHIP'),'Lọc loại hình');
const hcm=await api.listJobs({location:'Hồ Chí Minh',pageSize:100});
assert.ok(hcm.items.every(x=>x.location.includes('Hồ Chí Minh')),'Lọc địa điểm');
const salary=await api.listJobs({salary:'negotiable',pageSize:100});
assert.ok(salary.items.every(x=>x.salary_range.includes('Thỏa thuận')),'Lọc lương thỏa thuận');
const firstPage=await api.listJobs({pageSize:3,page:1});
const secondPage=await api.listJobs({pageSize:3,page:2});
assert.equal(firstPage.items.length,3,'Phân trang 3 tin');
assert.notEqual(firstPage.items[0].job_id,secondPage.items[0].job_id,'Trang khác nhau có tin khác');
const profile=await api.getProfile();
assert.ok(profile.candidate_id);
await api.saveProfile({full_name:'Sinh viên Kiểm thử'});
assert.equal((await api.getProfile()).full_name,'Sinh viên Kiểm thử','Lưu hồ sơ demo');
const result=await api.submitApplication({jobId:101,coverLetter:'Em mong muốn ứng tuyển.'});
assert.equal(result.status,'RECEIVED','Trạng thái nộp mới');
assert.equal((await api.listApplications()).length,1,'Lưu ứng tuyển trong demo');
await assert.rejects(()=>api.submitApplication({jobId:101}),err=>err.status===409,'Chặn ứng tuyển trùng');
await assert.rejects(()=>api.submitApplication({jobId:114}),err=>err.status===400,'Chặn tin đã đóng');
await assert.rejects(()=>api.submitApplication({jobId:115}),err=>err.status===400,'Chặn tin chưa duyệt');

const files=[
  'pages/candidate/index.html','pages/candidate/job-detail.html','pages/candidate/apply-job.html',
  'pages/candidate/my-applications.html','pages/candidate/cv-manage.html',
  'assets/css/style.css','assets/css/candidate.css','assets/js/api.js','assets/js/candidate.js'
];
for(const f of files)assert.ok(existsSync(path.join(frontend,f)),`Tồn tại ${f}`);
for(const file of files.filter(s=>s.endsWith('.html'))){
  const html=readFileSync(path.join(frontend,file),'utf8');
  assert.match(html,/<html lang="vi">/,'HTML lang vi');
  assert.match(html,/type="module" src="\.\.\/\.\.\/assets\/js\/candidate.js"/,'Kết nối candidate.js');
}
console.log('✓ PASS: bộ lọc, phân trang, ứng tuyển, chống trùng, trạng thái tin, hồ sơ và đường dẫn file.');
