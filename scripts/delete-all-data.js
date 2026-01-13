const { createClient } = require('@supabase/supabase-js');

// قراءة متغيرات البيئة مباشرة من الكود
const supabaseUrl = 'https://pahpaynwpogzlukpvvud.supabase.co';
const supabaseServiceKey = 'sb_secret_yaSiKQau-0BODS3wQJwnnQ_HE6hS-uG';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllData() {
  console.log('🗑️ بدء حذف جميع البيانات...');
  
  try {
    // قائمة الجداول بالترتيب المناسب (حذف الجداول التابعة أولاً)
    const tables = [
      'messages',        // حذف رسائل المحادثات أولاً
      'meeting_agents',  // حذف وكلاء الاجتماعات
      'meetings',        // حذف الاجتماعات
      'documents',       // حذف المستندات
      'projects',        // حذف المشاريع
      'team_members',    // حذف أعضاء الفريق
      'users'            // حذف المستخدمين (اختياري)
    ];

    for (const table of tables) {
      console.log(`حذف البيانات من جدول: ${table}`);
      
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // حذف جميع السجلات
      
      if (error) {
        console.error(`❌ خطأ في حذف جدول ${table}:`, error.message);
      } else {
        console.log(`✅ تم حذف البيانات من جدول ${table}`);
      }
    }
    
    console.log('✅ تم حذف جميع البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

// تنفيذ النص البرمجي
if (require.main === module) {
  deleteAllData().then(() => {
    console.log('اكتملت العملية');
    process.exit(0);
  }).catch(error => {
    console.error('فشلت العملية:', error);
    process.exit(1);
  });
}

module.exports = { deleteAllData };