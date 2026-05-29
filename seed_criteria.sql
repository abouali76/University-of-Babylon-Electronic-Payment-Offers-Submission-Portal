-- Seeding default evaluation criteria based on the system questions
INSERT INTO evaluation_criteria (question_text, category, weight, is_mandatory, display_order)
VALUES 
('هل تلتزم الشركة بالتسوية المالية خلال 12 ساعة عمل؟', 'Financial', 10.0, true, 1),
('هل توفر الشركة أجهزة صراف آلي (ATM) داخل الجامعة؟', 'Technical', 8.0, false, 2),
('هل تلتزم الشركة بتجهيز نقاط البيع (PoS) والصيانة مجاناً؟', 'Financial', 7.0, false, 3),
('هل يتوفر نظام إلكتروني متكامل للتقارير والتحويلات؟', 'Technical', 9.0, true, 4),
('هل الشركة حاصلة على شهادات الأمن العالمية (PCI-DSS / ISO)؟', 'Technical', 10.0, true, 5),
('هل تلتزم الشركة بنظام دعم فني على مدار الساعة (24/7)؟', 'Technical', 6.0, false, 6),
('هل توافق الشركة على خطاب ضمان مصرفي غير مشروط؟', 'Legal', 10.0, true, 7),
('هل تلتزم الشركة بملكية البيانات للجامعة حصراً؟', 'Legal', 10.0, true, 8),
('هل توفر الشركة تطبيق هاتفي (iOS/Android) للمستخدمين؟', 'Technical', 5.0, false, 9),
('هل الشركة مسجلة في القائمة السوداء للبنك المركزي؟', 'Legal', 10.0, true, 10);
