const rows = Object.freeze([
  [1,"Nghề của bố","What's his job?","Nghề của ông ấy là gì?","JOB IDENTIFICATION",6],
  [2,"Bố là bác sĩ","He's a doctor.","Ông ấy là bác sĩ.","JOB IDENTIFICATION",5],
  [3,"Nghề em muốn làm trong tương lai","What would you like to be in the future?","Trong tương lai, bạn muốn làm nghề gì?","FUTURE JOB CHOICE",8],
  [4,"Muốn làm bác sĩ","I'd like to be a doctor.","Tôi muốn làm bác sĩ.","FUTURE JOB CHOICE",6],
  [5,"Muốn làm lính cứu hỏa","I'd like to be a firefighter.","Tôi muốn làm lính cứu hỏa.","FUTURE JOB CHOICE",6],
  [6,"Muốn làm phóng viên","I'd like to be a reporter.","Tôi muốn làm phóng viên.","FUTURE JOB CHOICE",6],
  [7,"Muốn làm người làm vườn","I'd like to be a gardener.","Tôi muốn làm người làm vườn.","FUTURE JOB CHOICE",6],
  [8,"Muốn làm nhà văn","I'd like to be a writer.","Tôi muốn làm nhà văn.","FUTURE JOB CHOICE",6],
  [9,"Hỏi lý do chọn nghề bác sĩ","Why would you like to be a doctor?","Tại sao bạn muốn làm bác sĩ?","ASK WHY",8],
  [10,"Vì muốn giúp mọi người","Because I'd like to help people.","Bởi vì tôi muốn giúp mọi người.","GIVE REASONS",7],
  [11,"Hỏi lý do chọn nghề giáo viên","Why would you like to be a teacher?","Tại sao bạn muốn làm giáo viên?","ASK WHY",8],
  [12,"Vì muốn dạy trẻ em","Because I'd like to teach children.","Bởi vì tôi muốn dạy trẻ em.","GIVE REASONS",7],
  [13,"Vì muốn đưa tin","Because I'd like to report the news.","Bởi vì tôi muốn đưa tin.","GIVE REASONS",8],
  [14,"Vì muốn trồng hoa","Because I'd like to grow flowers.","Bởi vì tôi muốn trồng hoa.","GIVE REASONS",7],
  [15,"Vì muốn viết truyện","Because I'd like to write stories.","Bởi vì tôi muốn viết truyện.","GIVE REASONS",7],
  [16,"Có muốn làm lính cứu hỏa không?","Would you like to be a firefighter in the future?","Bạn có muốn làm lính cứu hỏa trong tương lai không?","WOULD YES/NO",8],
  [17,"Trả lời Không với would","No, I wouldn't.","Hãy trả lời ngắn “Không” cho câu hỏi dùng `would` ở trên.","WOULD SHORT ANSWER",5],
  [18,"Trả lời Có với would","Yes, I would.","Hãy trả lời ngắn “Có” cho câu hỏi dùng `would` ở trên.","WOULD SHORT ANSWER",5]
]);
export const g5U5WritingSource=Object.freeze(rows.map(([order,title,targetSentence,targetVi,family,expectedTimeMinutes])=>Object.freeze({id:`g5-u5-writing-target-${String(order).padStart(2,'0')}`,order,title,targetSentence,targetVi,family,expectedTimeMinutes,difficulty:expectedTimeMinutes<=6?'easy':'medium',feedbackReason:'Dùng đúng từ/cụm đã luyện để hoàn thành câu đích của Unit; cách tiếng Anh khác có thể dùng được nhưng không phải target đang chấm.',sourceType:'Global Success 5 transcript-aligned production lock',sourceNote:'Global Success 5 Unit 5 target-first production spec.'})));
