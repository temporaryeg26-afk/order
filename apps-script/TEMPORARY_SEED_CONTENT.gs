/**
 * TEMPORARY™ — SEED CONTENT  ·  v12.0   (add this file NEXT TO TEMPORARY_GS_CANONICAL.gs)
 *
 * Holds the DEFAULTS that TEMPORARY_SETUP() copies into the Sheet:
 *   1. CONTENT_REGISTRY  → every word on the website (EN + Egyptian Arabic), organised by page for the Admin.
 *   2. SPEC_TEMPLATES    → material, care icons, fit and size chart for each TEMPORARY™ product.
 *   3. SEED_POLICIES     → Returns & Exchanges, Shipping & Delivery, Privacy, Terms & Conditions (EN + AR).
 *
 * After setup the SHEET is the source of truth. Edit everything from the Admin — not here.
 * This file has no doGet/doPost and no triggers.
 */
/* =====================================================================
 * WEBSITE TEXT REGISTRY — every word the customer website shows.
 * Row: [KEY, PAGE, GROUP, ADMIN LABEL, TYPE, ENGLISH DEFAULT, ARABIC DEFAULT]
 *   TYPE  TEXT  = one line · LONG = several lines (new line = line break, **bold**)
 *         PLAIN = one value for both languages (email, phone, links)
 * TEMPORARY_SETUP() copies any missing key into SITE_CONTENT. After that the
 * Sheet value wins; these defaults are only used when a key is missing.
 * ===================================================================== */
var CONTENT_PAGES = [
  ['GLOBAL','Header, menu & footer'],['GATE','Sign-in page'],['HOME','Home page'],['SHOP','Shop page'],['PRODUCT','Product page'],
  ['SIZE_GUIDE','Size guide page'],['CUSTOMIZER','Customizer'],['CHECKOUT','Bag & checkout'],['ACCOUNT','Account & order status'],
  ['ABOUT','About page'],['CONTACT','Contact page'],['POLICIES','Policies pages (labels)'],['VERIFY','Verify / authenticity page'],['CONFIRM','Order confirmation page'],
  ['MESSAGES','Messages & errors'],['COLORS','Colour names']
];
var CONTENT_REGISTRY = [
  /* ---------- GLOBAL ---------- */
  ['brandWordmark','GLOBAL','Header','Brand wordmark','PLAIN','TEMPORARY™',''],
  ['navHome','GLOBAL','Menu','Menu: Home','TEXT','Home','الرئيسية'],
  ['navShop','GLOBAL','Menu','Menu: Shop','TEXT','Shop','المتجر'],
  ['navSizeGuide','GLOBAL','Menu','Menu: Size guide','TEXT','Size guide','دليل المقاسات'],
  ['navAbout','GLOBAL','Menu','Menu: About','TEXT','About','عن TEMPORARY™'],
  ['navContact','GLOBAL','Menu','Menu: Contact','TEXT','Contact','تواصل معانا'],
  ['navPolicies','GLOBAL','Menu','Menu: Policies','TEXT','Policies','السياسات'],
  ['navVerify','GLOBAL','Menu','Menu: Verify','TEXT','Verify','تأكد من الأصلي'],
  ['navAccount','GLOBAL','Menu','Menu: Account','TEXT','Account','حسابي'],
  ['navBag','GLOBAL','Menu','Menu: Bag','TEXT','Bag','السلة'],
  ['menu','GLOBAL','Menu','Mobile menu title','TEXT','Menu','القائمة'],
  ['visualLabel','GLOBAL','Header','Theme switch label','TEXT','Visual','الشكل'],
  ['marquee1','GLOBAL','Moving banner','Banner text 1','TEXT','Limited production','إنتاج محدود'],
  ['marquee2','GLOBAL','Moving banner','Banner text 2','TEXT','No restocks','مفيش إعادة إنتاج'],
  ['marquee3','GLOBAL','Moving banner','Banner text 3','TEXT','Designed in Cairo','متصمم في القاهرة'],
  ['marquee4','GLOBAL','Moving banner','Banner text 4','TEXT','Everything is temporary','كل حاجة مؤقتة'],
  ['footerTagline','GLOBAL','Footer','Footer text','LONG','Everything is temporary.\nMade in Cairo. Built to disappear.','كل حاجة مؤقتة.\nمعمولة في القاهرة. ومعمولة عشان تختفي.'],
  ['footerShop','GLOBAL','Footer','Column title: Shop','TEXT','Shop','المتجر'],
  ['footerHelp','GLOBAL','Footer','Column title: Help','TEXT','Help','المساعدة'],
  ['footerPolicies','GLOBAL','Footer','Column title: Policies','TEXT','Policies','السياسات'],
  ['footerFollow','GLOBAL','Footer','Column title: Follow','TEXT','Follow','تابعنا'],
  ['footerBottom','GLOBAL','Footer','Bottom line','TEXT','Temporary people · Bolder today · A brighter tomorrow','ناس مؤقتة · أجرأ النهارده · وبكرة أحلى'],
  ['footerRights','GLOBAL','Footer','Copyright text','TEXT','All rights reserved.','كل الحقوق محفوظة.'],
  ['allPolicies','GLOBAL','Footer','Link: all policies','TEXT','All policies','كل السياسات'],
  ['loading','GLOBAL','Common words','Loading','TEXT','Loading…','بنحمّل…'],
  ['back','GLOBAL','Common words','Back','TEXT','Back','رجوع'],
  ['readMore','GLOBAL','Common words','Read','TEXT','Read','اقرا'],
  ['print','GLOBAL','Common words','Print','TEXT','Print','اطبع'],
  ['retry','GLOBAL','Common words','Retry','TEXT','Retry','حاول تاني'],
  ['pageNotFound','GLOBAL','Common words','Page not found','TEXT','This page does not exist.','الصفحة دي مش موجودة.'],

  /* ---------- GATE ---------- */
  ['gateLeft','GATE','Sign-in page','Top label','TEXT','CAIRO / EGYPT','القاهرة / مصر'],
  ['gate1','GATE','Sign-in page','Big title line 1','TEXT','Everything','كل حاجة'],
  ['gate2','GATE','Sign-in page','Big title line 2','TEXT','Is','هي'],
  ['gate3','GATE','Sign-in page','Big title line 3','TEXT','Temporary.','مؤقتة.'],
  ['gateSub','GATE','Sign-in page','Text under title','LONG','Limited pieces. No restocks on the drop. Enter the archive through your Google account.','قطع محدودة. مفيش إعادة إنتاج. ادخل الأرشيف بحساب Google بتاعك.'],
  ['authReady','GATE','Sign-in page','Status: ready','TEXT','SECURE ACCESS · READY','دخول آمن · جاهز'],
  ['authWorking','GATE','Sign-in page','Status: verifying','TEXT','SECURE ACCESS · VERIFYING','دخول آمن · بنتحقق'],
  ['signInCta','GATE','Sign-in page','Sign-in button','TEXT','Sign in','سجّل دخول'],
  ['signInToBuyTitle','GATE','Sign-in window (open website)','Title','TEXT','Sign in to continue','سجّل دخول عشان تكمّل'],
  ['signInToBuyBody','GATE','Sign-in window (open website)','Text','LONG','Sign in with your Google account to add pieces to your bag, place orders and see your archive.','سجّل دخول بحساب Google عشان تضيف قطع للسلة، وتعمل طلبات، وتشوف أرشيفك.'],

  /* ---------- HOME ---------- */
  ['heroCta','HOME','Hero','Hero button','TEXT','Enter collection','ادخل المجموعة'],
  ['heroCta2','HOME','Hero','Hero second button','TEXT','Size guide','دليل المقاسات'],
  ['heroTitle','HOME','Hero','Hero title (used only if the theme has no title)','LONG','Not made\nto stay.','مش معمول\nعشان يفضل.'],
  ['collection','HOME','Collection','Section label','TEXT','THE COLLECTION','المجموعة'],
  ['chooseUniform','HOME','Collection','Section title','LONG','Choose your\nuniform.','اختار\nلبسك.'],
  ['collectionCopy','HOME','Collection','Section text','LONG','Limited pieces from the current drop. Pick your piece, choose your design, make it yours.','قطع محدودة من الدروب الحالي. اختار قطعتك، اختار تصميمك، وخليها بتاعتك.'],
  ['viewAll','HOME','Collection','Button: view all','TEXT','View all pieces','شوف كل القطع'],
  ['theRule','HOME','The rule','Section label','TEXT','THE RULE','القاعدة'],
  ['ruleWord','HOME','The rule','Big word','LONG','TEMP.\nONLY.','مؤقت.\nبس.'],
  ['manifesto','HOME','The rule','Manifesto text','LONG','The value is not in owning more. It is in owning something that was allowed to disappear.','القيمة مش في إنك تملك أكتر. القيمة في إنك تملك حاجة اتسمح لها إنها تختفي.'],
  ['m1','HOME','The rule','Rule line 1','TEXT','Limited production per design','إنتاج محدود لكل تصميم'],
  ['m2','HOME','The rule','Rule line 2','TEXT','20 × 20 cm or 30 × 30 cm design print','طباعة تصميم 20 × 20 أو 30 × 30 سم'],
  ['m3','HOME','The rule','Rule line 3','TEXT','7 × 7 cm TEMPORARY™ logo','لوجو TEMPORARY™ مقاس 7 × 7 سم'],
  ['m4','HOME','The rule','Rule line 4','TEXT','Secure online payment · card & wallet','دفع أونلاين آمن · كارت أو محفظة'],
  ['whyKicker','HOME','Why TEMPORARY™','Section label','TEXT','WHY TEMPORARY™','ليه TEMPORARY™'],
  ['whyTitle','HOME','Why TEMPORARY™','Section title','LONG','Built\ndifferent.','معمول\nبشكل مختلف.'],
  ['f1Title','HOME','Why TEMPORARY™','Point 1 title','TEXT','Premium materials','خامات بريميوم'],
  ['f1Body','HOME','Why TEMPORARY™','Point 1 text','TEXT','Carefully selected for comfort and durability.','متختارة بعناية عشان الراحة والعمر الطويل.'],
  ['f2Title','HOME','Why TEMPORARY™','Point 2 title','TEXT','Quality construction','تنفيذ بجودة'],
  ['f2Body','HOME','Why TEMPORARY™','Point 2 text','TEXT','Side-seamed and double-needle stitched.','خياطة جانبية وغرزة مزدوجة.'],
  ['f3Title','HOME','Why TEMPORARY™','Point 3 title','TEXT','Built to last','معمول عشان يعيش'],
  ['f3Body','HOME','Why TEMPORARY™','Point 3 text','TEXT','Timeless pieces for a longer tomorrow.','قطع مابتقدمش لبكرة أطول.'],
  ['f4Title','HOME','Why TEMPORARY™','Point 4 title','TEXT','Easy care','عناية سهلة'],
  ['f4Body','HOME','Why TEMPORARY™','Point 4 text','TEXT','Simple steps to keep it fresh.','خطوات بسيطة عشان يفضل جديد.'],
  ['archive','HOME','Your archive','Section label','TEXT','ARCHIVE','الأرشيف'],
  ['archiveMuseumTitle','HOME','Your archive','Section title','LONG','Your pieces.','قطعك.'],
  ['archiveMuseumSub','HOME','Your archive','Section text','LONG','Every design you own, preserved once.','كل تصميم امتلكته، محفوظ في أرشيفك.'],
  ['noOwnedDesigns','HOME','Your archive','Empty archive','TEXT','Your designs appear here after delivery.','تصميماتك هتظهر هنا بعد التسليم.'],
  ['signInOrders','HOME','Your archive','Signed-out message','TEXT','Sign in to view your archive.','سجّل دخولك عشان تشوف أرشيفك.'],

  /* ---------- SHOP ---------- */
  ['shopKicker','SHOP','Page header','Page label','TEXT','THE COLLECTION','المجموعة'],
  ['shopTitle','SHOP','Page header','Page title','LONG','All\npieces.','كل\nالقطع.'],
  ['shopCopy','SHOP','Page header','Page text','LONG','Every piece is produced in a limited run. When a design sells out, it is archived.','كل قطعة بتتعمل بكمية محدودة. ولما التصميم يخلص، بيدخل الأرشيف.'],
  ['all','SHOP','Filters','Filter: All','TEXT','All','الكل'],
  ['T_SHIRT','SHOP','Filters','Filter: T-shirts','TEXT','T-Shirts','تيشيرتات'],
  ['LONG_SLEEVE','SHOP','Filters','Filter: Long sleeve','TEXT','Long Sleeve','كم طويل'],
  ['CREWNECK','SHOP','Filters','Filter: Crewneck','TEXT','Crewneck','كرو نِك'],
  ['HOODIE','SHOP','Filters','Filter: Hoodies','TEXT','Hoodies','هوديز'],
  ['KIDS','SHOP','Filters','Filter: Kids','TEXT','Kids','أطفال'],
  ['OTHER','SHOP','Filters','Filter: Other','TEXT','Other','تاني'],
  ['details','SHOP','Product card','Button: Details','TEXT','Details','التفاصيل'],
  ['sizeChart','SHOP','Product card','Button: Size chart','TEXT','Size Chart','جدول المقاسات'],
  ['customizeBuy','SHOP','Product card','Button: Customize & buy','TEXT','Customize & Buy','خصّص واشتري'],
  ['emptyShop','SHOP','Product card','No products in filter','TEXT','No pieces in this category yet.','مفيش قطع في القسم ده لسه.'],

  /* ---------- PRODUCT ---------- */
  ['limitedNote','PRODUCT','Product page','Limited note under price','TEXT','Limited production per design. No restocks on the drop.','إنتاج محدود لكل تصميم. مفيش إعادة إنتاج.'],
  ['chooseColor','PRODUCT','Product page','Label: colour','TEXT','Colour','اللون'],
  ['availableSizes','PRODUCT','Product page','Label: sizes','TEXT','Sizes','المقاسات'],
  ['tabDetails','PRODUCT','Product page','Tab: Details','TEXT','Details','التفاصيل'],
  ['tabSize','PRODUCT','Product page','Tab: Size chart','TEXT','Size Chart','جدول المقاسات'],
  ['tabCare','PRODUCT','Product page','Tab: Material & care','TEXT','Material & Care','الخامة والعناية'],
  ['relatedTitle','PRODUCT','Product page','Title: other products','TEXT','You may also like','ممكن يعجبك كمان'],
  ['productCode','PRODUCT','Product page','Label: product code','TEXT','Product code','كود المنتج'],
  ['material','PRODUCT','Material & care labels','Label: Material','TEXT','Material','الخامة'],
  ['lining','PRODUCT','Material & care labels','Label: Lining','TEXT','Inside','من جوه'],
  ['weight','PRODUCT','Material & care labels','Label: Fabric weight','TEXT','Fabric weight','وزن القماش'],
  ['gsmUnit','PRODUCT','Material & care labels','Unit after weight','TEXT','g/m² (gsm)','جرام/م²'],
  ['fit','PRODUCT','Material & care labels','Label: Fit','TEXT','Fit','القَصّة'],
  ['construction','PRODUCT','Material & care labels','Label: Construction','TEXT','Construction','التنفيذ'],
  ['care','PRODUCT','Material & care labels','Title: Care instructions','TEXT','Care instructions','تعليمات العناية'],
  ['careNotes','PRODUCT','Material & care labels','Title: Extra care notes','TEXT','Good to know','معلومة مهمة'],
  ['care_WASH_INSIDE_OUT','PRODUCT','Care icons','Icon: Wash inside out','TEXT','Wash inside out','اغسله مقلوب'],
  ['care_BELOW_30','PRODUCT','Care icons','Icon: Below 30°C','TEXT','Below 30°C','أقل من 30°'],
  ['care_DELICATE','PRODUCT','Care icons','Icon: Delicate cycle','TEXT','Delicate cycle','برنامج هادي'],
  ['care_NO_SOFTENER','PRODUCT','Care icons','Icon: No fabric softener','TEXT','Do not use fabric softeners','من غير منعّم أقمشة'],
  ['care_IRON_INSIDE_OUT','PRODUCT','Care icons','Icon: Iron inside out','TEXT','Iron inside out','اكويه مقلوب'],
  ['care_NO_BLEACH','PRODUCT','Care icons','Icon: No bleach','TEXT','Do not bleach','من غير كلور'],
  ['care_NO_TUMBLE_DRY','PRODUCT','Care icons','Icon: No tumble dry','TEXT','Do not tumble dry','ما يدخلش النشّافة'],
  ['care_LINE_DRY','PRODUCT','Care icons','Icon: Line dry','TEXT','Line dry in shade','ينشف على الحبل في الضل'],
  ['care_NO_DRY_CLEAN','PRODUCT','Care icons','Icon: No dry clean','TEXT','Do not dry clean','ما يتغسلش دراي كلين'],
  ['chartUnits','PRODUCT','Size chart','Units line','TEXT','All measurements in centimeters (CM)','كل المقاسات بالسنتيمتر'],
  ['size','PRODUCT','Size chart','Column: Size','TEXT','Size','المقاس'],
  ['width','PRODUCT','Size chart','Column: Width','TEXT','Width','العرض'],
  ['length','PRODUCT','Size chart','Column: Length','TEXT','Length','الطول'],
  ['avgWeight','PRODUCT','Size chart','Column: Avg. weight','TEXT','Avg. weight (kg)','متوسط الوزن (كجم)'],
  ['ageRange','PRODUCT','Size chart','Column: Age range','TEXT','Age range','السن'],
  ['ageYears','PRODUCT','Size chart','Age format ({a} and {b} are numbers)','TEXT','{a}–{b} years','{a}–{b} سنين'],
  ['sizeYearsLabel','PRODUCT','Size chart','Kids size label ({n} = age)','TEXT','{n} YRS','{n} سنين'],
  ['fitTitle','PRODUCT','Size chart','Title: Fit','TEXT','Fit','القَصّة'],
  ['sizeTolerance','PRODUCT','Size chart','Tolerance note','TEXT','Sizes may vary 1 to 2 cm due to production tolerances.','المقاسات ممكن تختلف من 1 لـ 2 سم بسبب فروق الإنتاج.'],
  ['howToMeasure','PRODUCT','How to measure','Title','TEXT','How to measure','تقيس إزاي'],
  ['howToMeasureBody','PRODUCT','How to measure','Text','LONG','Measure from one side only (front or back).\nFollow the guide lines for the measurement position.','قيس من ناحية واحدة بس (قدام أو ورا).\nامشي على الخطوط اللي في الرسمة عشان تعرف تقيس منين.'],
  ['widthHint','PRODUCT','How to measure','Width label','TEXT','Width (chest)','العرض (الصدر)'],
  ['lengthHint','PRODUCT','How to measure','Length label','TEXT','Length (top to bottom)','الطول (من فوق لتحت)'],
  ['finderTitle','PRODUCT','Size finder','Title','TEXT','Find your size','اعرف مقاسك'],
  ['finderWeight','PRODUCT','Size finder','Weight field','TEXT','Your weight (kg)','وزنك (كجم)'],
  ['finderAge','PRODUCT','Size finder','Age field','TEXT','Child’s age (years)','سن الطفل (بالسنين)'],
  ['finderResult','PRODUCT','Size finder','Result ({size} = size)','TEXT','Suggested size: {size}','المقاس المناسب: {size}'],
  ['finderNone','PRODUCT','Size finder','No match','TEXT','No exact match. Check the width and length above.','مفيش مقاس مطابق بالظبط. راجع العرض والطول فوق.'],
  ['finderNote','PRODUCT','Size finder','Small note','TEXT','A suggestion based on averages. Check width and length for the best fit.','ده اقتراح على حسب المتوسط. راجع العرض والطول عشان تختار أحسن مقاس.'],

  /* ---------- SIZE GUIDE ---------- */
  ['sizeGuideKicker','SIZE_GUIDE','Page header','Page label','TEXT','SIZE GUIDE','دليل المقاسات'],
  ['sizeGuideTitle','SIZE_GUIDE','Page header','Page title','LONG','Find\nyour fit.','اعرف\nمقاسك.'],
  ['sizeGuideIntro','SIZE_GUIDE','Page header','Page text','LONG','Every TEMPORARY™ piece has its own size chart. Compare the width and length with a piece you already own for the best fit.','كل قطعة من TEMPORARY™ ليها جدول مقاسات خاص بيها. قارن العرض والطول بقطعة عندك عشان تختار المقاس الصح.'],
  ['adults','SIZE_GUIDE','Groups','Group: Adults','TEXT','Adults','الكبار'],
  ['kids','SIZE_GUIDE','Groups','Group: Kids','TEXT','Kids','الأطفال'],

  /* ---------- CUSTOMIZER ---------- */
  ['customizer','CUSTOMIZER','Customizer','Window label','TEXT','CUSTOMIZER','التخصيص'],
  ['design','CUSTOMIZER','Customizer','Label: Design','TEXT','Design','التصميم'],
  ['placement','CUSTOMIZER','Customizer','Label: Placement','TEXT','Placement','مكان الطباعة'],
  ['designFront','CUSTOMIZER','Customizer','Option: design front','TEXT','DESIGN FRONT + LOGO BACK','التصميم قدام + اللوجو ورا'],
  ['designBack','CUSTOMIZER','Customizer','Option: design back','TEXT','LOGO FRONT + DESIGN BACK','اللوجو قدام + التصميم ورا'],
  ['printSize','CUSTOMIZER','Customizer','Label: Print size','TEXT','Print size','مقاس الطباعة'],
  ['color','CUSTOMIZER','Customizer','Label: Colour','TEXT','Colour','اللون'],
  ['quantity','CUSTOMIZER','Customizer','Label: Quantity','TEXT','Quantity','الكمية'],
  ['addToBag','CUSTOMIZER','Customizer','Button: Add to bag','TEXT','Add to bag','ضيف للسلة'],
  ['unavailable','CUSTOMIZER','Customizer','Combination not available','TEXT','This combination is not available yet.','الاختيار ده مش متاح لسه.'],
  ['soldOut','CUSTOMIZER','Customizer','Sold out','TEXT','SOLD OUT','خلص'],
  ['added','CUSTOMIZER','Customizer','Added message','TEXT','Added to your bag.','اتضاف للسلة.'],
  ['previewOnly','CUSTOMIZER','Customizer','Admin preview message','TEXT','Preview mode — the bag is disabled.','وضع المعاينة — السلة مقفولة.'],

  /* ---------- CHECKOUT ---------- */
  ['yourBag','CHECKOUT','Bag','Bag label','TEXT','YOUR BAG','سلتك'],
  ['selectedPieces','CHECKOUT','Bag','Bag title','TEXT','Selected pieces.','القطع اللي اخترتها.'],
  ['subtotal','CHECKOUT','Bag','Subtotal','TEXT','Subtotal','المجموع'],
  ['checkout','CHECKOUT','Bag','Button: Checkout','TEXT','Checkout','إتمام الطلب'],
  ['serverNote','CHECKOUT','Bag','Note under bag','TEXT','Final price, quantity and delivery fee are verified by TEMPORARY™.','السعر النهائي والكمية ومصاريف التوصيل بتتأكد من TEMPORARY™.'],
  ['emptyBag','CHECKOUT','Bag','Empty bag','TEXT','Your bag is empty.','السلة فاضية.'],
  ['remove','CHECKOUT','Bag','Button: Remove','TEXT','Remove','شيل'],
  ['cashOnDelivery','CHECKOUT','Checkout form','Checkout title','TEXT','Secure payment','دفع آمن'],
  ['name','CHECKOUT','Checkout form','Field: Name','TEXT','Name','الاسم'],
  ['email','CHECKOUT','Checkout form','Field: Email','TEXT','Email','الإيميل'],
  ['phone','CHECKOUT','Checkout form','Field: Phone','TEXT','Phone','رقم الموبايل'],
  ['birthday','CHECKOUT','Checkout form','Field: Birthday','TEXT','Birthday','تاريخ الميلاد'],
  ['governorate','CHECKOUT','Checkout form','Field: Governorate','TEXT','Governorate','المحافظة'],
  ['selectGovernorate','CHECKOUT','Checkout form','Governorate placeholder','TEXT','Select governorate','اختار المحافظة'],
  ['area','CHECKOUT','Checkout form','Field: Area','TEXT','Area','المنطقة'],
  ['address','CHECKOUT','Checkout form','Field: Address','TEXT','Full address','العنوان بالتفصيل'],
  ['cod','CHECKOUT','Checkout form','Payment title','TEXT','Pay online','ادفع أونلاين'],
  ['codSub','CHECKOUT','Checkout form','Payment text','TEXT','Card or mobile wallet · secure checkout by Paymob','كارت أو محفظة · دفع آمن من خلال Paymob'],
  ['confirmDetails','CHECKOUT','Checkout form','Confirm checkbox','TEXT','I confirm the customer and delivery details are correct.','أنا متأكد إن البيانات وبيانات التوصيل صحيحة.'],
  ['agreeTerms','CHECKOUT','Checkout form','Terms note','TEXT','By paying you agree to the Terms & Conditions and our policies.','لما تدفع تبقى موافق على الشروط والأحكام وسياساتنا.'],
  ['placeOrder','CHECKOUT','Checkout form','Button: Place order','TEXT','Pay securely','ادفع بأمان'],
  ['orderSummary','CHECKOUT','Checkout form','Summary title','TEXT','ORDER SUMMARY','ملخص الطلب'],
  ['delivery','CHECKOUT','Checkout form','Delivery fee','TEXT','Delivery','التوصيل'],
  ['total','CHECKOUT','Checkout form','Total','TEXT','Total','الإجمالي'],
  ['deliveryError','CHECKOUT','Checkout form','Area not delivered','TEXT','We do not deliver to this area yet.','مش بنوصّل للمنطقة دي لسه.'],
  ['processingTitle','CHECKOUT','After ordering','Processing title','TEXT','Processing…','بنجهّز طلبك…'],
  ['processingCopy','CHECKOUT','After ordering','Processing text','TEXT','Your order is being verified securely. Please do not close this window.','طلبك بيتأكد بأمان. ما تقفلش الصفحة.'],
  ['orderReceived','CHECKOUT','After ordering','Success title (if message sheet is empty)','TEXT','Order received','تم استلام طلبك'],
  ['confirmationWindowKicker','CHECKOUT','After ordering','Confirmation window label','TEXT','CONFIRMATION WINDOW','فترة التأكيد'],
  ['confirmationInstruction','CHECKOUT','After ordering','Confirmation instruction','TEXT','Check your email from TEMPORARY™ and click the confirmation link.','افتح الإيميل اللي جالك من TEMPORARY™ واضغط على رابط التأكيد.'],
  ['hours','CHECKOUT','After ordering','Word: hour(s)','TEXT','HOUR(S)','ساعة'],
  ['confirmBy','CHECKOUT','After ordering','Confirm by','TEXT','Confirm by','أكّد قبل'],
  ['continueShopping','CHECKOUT','After ordering','Button: continue','TEXT','Continue shopping','كمّل تسوق'],

  /* ---------- ACCOUNT ---------- */
  ['account','ACCOUNT','Account','Account label','TEXT','ACCOUNT','الحساب'],
  ['yourArchive','ACCOUNT','Account','Account title','TEXT','Your archive.','أرشيفك.'],
  ['noOrders','ACCOUNT','Account','No orders','TEXT','No orders yet.','مفيش طلبات لسه.'],
  ['logout','ACCOUNT','Account','Button: Log out','TEXT','Log out','تسجيل خروج'],
  ['status_PENDING','ACCOUNT','Order status','Awaiting confirmation','TEXT','Awaiting payment','مستني الدفع'],
  ['status_CONFIRMED','ACCOUNT','Order status','Confirmed','TEXT','Confirmed','اتأكد'],
  ['status_PROCESSING','ACCOUNT','Order status','Processing','TEXT','Processing','جاري التجهيز'],
  ['status_READY_FOR_DELIVERY','ACCOUNT','Order status','Ready for delivery','TEXT','Ready for delivery','جاهز للتوصيل'],
  ['status_OUT_FOR_DELIVERY','ACCOUNT','Order status','Out for delivery','TEXT','Out for delivery','في الطريق'],
  ['status_SHIPPED','ACCOUNT','Order status','Shipped','TEXT','Shipped','اتشحن'],
  ['status_DELIVERED','ACCOUNT','Order status','Delivered','TEXT','Delivered','اتسلّم'],
  ['status_CANCELED','ACCOUNT','Order status','Canceled','TEXT','Canceled','اتلغى'],

  /* ---------- ABOUT ---------- */
  ['aboutKicker','ABOUT','Header','Page label','TEXT','ABOUT TEMPORARY™','عن TEMPORARY™'],
  ['aboutTitle','ABOUT','Header','Page title','LONG','Everything\nis temporary.','كل حاجة\nمؤقتة.'],
  ['aboutIntro','ABOUT','Header','Intro','LONG','TEMPORARY™ is a limited-edition clothing brand from Cairo. We release our pieces in drops, produce them in limited quantities, and let them go when they are gone.','TEMPORARY™ براند ملابس بإصدارات محدودة من القاهرة. بننزل قطعنا في دروبس، وبنعملها بكميات محدودة، ولما تخلص بنسيبها تمشي.'],
  ['aboutS1Title','ABOUT','Story','Part 1 title','TEXT','The idea','الفكرة'],
  ['aboutS1Body','ABOUT','Story','Part 1 text','LONG','Nothing lasts forever — not trends, not moments, not seasons. We build around that truth. Every design is released once, in a limited run, so the pieces you own stay rare and personal.','مفيش حاجة بتدوم — لا الترندات، ولا اللحظات، ولا المواسم. وإحنا بنبني على الحقيقة دي. كل تصميم بينزل مرة واحدة وبكمية محدودة، عشان القطع اللي معاك تفضل نادرة وتخصك.'],
  ['aboutS2Title','ABOUT','Story','Part 2 title','TEXT','Limited by design','محدودة بتصميمها'],
  ['aboutS2Body','ABOUT','Story','Part 2 text','LONG','Each design has a fixed production limit. When it sells out, it moves to the archive — no restocks on the drop. Limited pieces last longer, because they mean more.','كل تصميم ليه حد إنتاج ثابت. ولما يخلص، بيدخل الأرشيف — مفيش إعادة إنتاج. القطع المحدودة بتعيش أكتر، لأنها بتعني أكتر.'],
  ['aboutS3Title','ABOUT','Story','Part 3 title','TEXT','Made with process','معمولة بنظام'],
  ['aboutS3Body','ABOUT','Story','Part 3 text','LONG','Every order is printed and prepared after you confirm it, then checked, packed and delivered. Premium fabrics, side-seamed construction and double-needle stitching — made to be worn, built to last.','كل طلب بيتطبع ويتجهز بعد ما تأكده، وبعدين بيتراجع ويتغلف ويتوصل. خامات بريميوم، وخياطة جانبية، وغرزة مزدوجة — معمول عشان يتلبس، ومتعمل عشان يعيش.'],
  ['aboutS4Title','ABOUT','Story','Part 4 title','TEXT','Same mindset. Different generation.','نفس العقلية. جيل مختلف.'],
  ['aboutS4Body','ABOUT','Story','Part 4 text','LONG','From adults to kids, one mindset runs through every piece: wear what means something, and own it while it lasts.','من الكبار للأطفال، فيه عقلية واحدة في كل قطعة: البس حاجة ليها معنى، واستمتع بيها طول ما هي موجودة.'],
  ['aboutValuesTitle','ABOUT','Values','Values title','TEXT','What we stand for','إحنا مع إيه'],
  ['aboutV1Title','ABOUT','Values','Value 1 title','TEXT','Not for everyone','مش لأي حد'],
  ['aboutV1Body','ABOUT','Values','Value 1 text','LONG','Small runs, strong identity. Made for people who choose on purpose.','كميات صغيرة وشخصية قوية. معمول للناس اللي بتختار بقصد.'],
  ['aboutV2Title','ABOUT','Values','Value 2 title','TEXT','Limited pieces last longer','القطع المحدودة بتعيش أكتر'],
  ['aboutV2Body','ABOUT','Values','Value 2 text','LONG','Fewer pieces, better made, kept longer.','قطع أقل، معمولة أحسن، وبتعيش معاك أكتر.'],
  ['aboutV3Title','ABOUT','Values','Value 3 title','TEXT','Designed in Cairo','متصمم في القاهرة'],
  ['aboutV3Body','ABOUT','Values','Value 3 text','LONG','Born in the city, made for the street, worn everywhere.','اتولد في المدينة، معمول للشارع، ويتلبس في كل حتة.'],
  ['aboutClosing','ABOUT','Closing','Closing line','LONG','Temporary people.\nBolder today.\nA brighter tomorrow.','ناس مؤقتة.\nأجرأ النهارده.\nوبكرة أحلى.'],
  ['aboutCta','ABOUT','Closing','Closing button','TEXT','Shop the collection','شوف المجموعة'],

  /* ---------- CONTACT ---------- */
  ['contactKicker','CONTACT','Header','Page label','TEXT','CONTACT','تواصل معانا'],
  ['contactTitle','CONTACT','Header','Page title','LONG','Talk\nto us.','كلمنا.'],
  ['contactIntro','CONTACT','Header','Intro','LONG','Questions about an order, sizing, delivery or returns? Reach us directly or send an inquiry below.','عندك سؤال عن طلب، أو مقاس، أو توصيل، أو استرجاع؟ كلمنا على طول أو ابعت استفسارك تحت.'],
  ['contactDetailsTitle','CONTACT','Contact details','Section title','TEXT','Contact details','بيانات التواصل'],
  ['contactEmail','CONTACT','Contact details','Support email (inquiries are sent here)','PLAIN','',''],
  ['contactPhone','CONTACT','Contact details','Phone number','PLAIN','',''],
  ['contactWhatsapp','CONTACT','Contact details','WhatsApp number (with country code, e.g. 201xxxxxxxxx)','PLAIN','',''],
  ['contactAddress','CONTACT','Contact details','Address','LONG','Cairo, EG','القاهرة، مصر'],
  ['contactMapUrl','CONTACT','Contact details','Google Maps link (optional)','PLAIN','',''],
  ['contactHours','CONTACT','Contact details','Working hours','LONG','',''],
  ['socialInstagram','CONTACT','Social links','Instagram link','PLAIN','',''],
  ['socialTiktok','CONTACT','Social links','TikTok link','PLAIN','',''],
  ['socialFacebook','CONTACT','Social links','Facebook link','PLAIN','',''],
  ['contactEmailLabel','CONTACT','Labels','Label: Email','TEXT','Email','الإيميل'],
  ['contactPhoneLabel','CONTACT','Labels','Label: Phone','TEXT','Phone','التليفون'],
  ['contactWhatsappLabel','CONTACT','Labels','Label: WhatsApp','TEXT','WhatsApp','واتساب'],
  ['contactAddressLabel','CONTACT','Labels','Label: Address','TEXT','Address','العنوان'],
  ['contactHoursLabel','CONTACT','Labels','Label: Working hours','TEXT','Working hours','مواعيد الشغل'],
  ['contactSocialLabel','CONTACT','Labels','Label: Social','TEXT','Social','السوشيال'],
  ['openMap','CONTACT','Labels','Link: open map','TEXT','Open in Maps','افتح على الخريطة'],
  ['contactFormTitle','CONTACT','Inquiry form','Form title','TEXT','Send an inquiry','ابعت استفسار'],
  ['contactFormIntro','CONTACT','Inquiry form','Form text','LONG','Write your message and we will reply to your email.','اكتب رسالتك وهنرد عليك على الإيميل.'],
  ['formName','CONTACT','Inquiry form','Field: Name','TEXT','Full name','الاسم بالكامل'],
  ['formEmail','CONTACT','Inquiry form','Field: Email','TEXT','Email','الإيميل'],
  ['formPhone','CONTACT','Inquiry form','Field: Phone (optional)','TEXT','Phone (optional)','رقم الموبايل (اختياري)'],
  ['formTopic','CONTACT','Inquiry form','Field: Topic','TEXT','Topic','الموضوع'],
  ['formOrderNumber','CONTACT','Inquiry form','Field: Order number','TEXT','Order number','رقم الطلب'],
  ['formMessage','CONTACT','Inquiry form','Field: Message','TEXT','Message','رسالتك'],
  ['formSend','CONTACT','Inquiry form','Button: Send','TEXT','Send inquiry','ابعت الاستفسار'],
  ['formSent','CONTACT','Inquiry form','Sent message','LONG','Thank you — your inquiry was sent. We will reply to your email.','شكرًا — استفسارك اتبعت، وهنرد عليك على الإيميل.'],
  ['formRequired','CONTACT','Inquiry form','Missing fields','TEXT','Please fill in your name, email and message.','ياريت تكتب اسمك وإيميلك ورسالتك.'],
  ['topicGeneral','CONTACT','Inquiry topics','Topic: General question','TEXT','General question','سؤال عام'],
  ['topicOrder','CONTACT','Inquiry topics','Topic: My order','TEXT','My order','طلبي'],
  ['topicDelivery','CONTACT','Inquiry topics','Topic: Delivery','TEXT','Delivery','التوصيل'],
  ['topicReturn','CONTACT','Inquiry topics','Topic: Return or exchange','TEXT','Return or exchange','استرجاع أو استبدال'],
  ['topicDefect','CONTACT','Inquiry topics','Topic: Product issue','TEXT','Product issue / defect','مشكلة أو عيب في المنتج'],
  ['topicSizing','CONTACT','Inquiry topics','Topic: Sizing','TEXT','Sizing help','مساعدة في المقاس'],
  ['topicOther','CONTACT','Inquiry topics','Topic: Other','TEXT','Other','حاجة تانية'],
  ['photosNoteTitle','CONTACT','Photos note','Title','TEXT','Need to send photos or a video?','محتاج تبعت صور أو فيديو؟'],
  ['photosNoteBody','CONTACT','Photos note','Text ({email} = support email)','LONG','The form accepts text only. Email us from your own email at **{email}**, attach the photos or video, and include your order number.','الفورم بيقبل كلام بس. ابعت لنا من إيميلك على **{email}**، وضيف الصور أو الفيديو، واكتب رقم الطلب.'],
  ['photosNoteButton','CONTACT','Photos note','Button: email us','TEXT','Email us','ابعت إيميل'],

  /* ---------- POLICIES (labels only — policy text lives in Policies) ---------- */
  ['policiesKicker','POLICIES','Policies list page','Page label','TEXT','LEGAL','السياسات'],
  ['policiesTitle','POLICIES','Policies list page','Page title','LONG','Policies.','السياسات.'],
  ['policiesIntro','POLICIES','Policies list page','Page text','LONG','Everything you need to know about ordering, delivery, returns and your data.','كل اللي محتاج تعرفه عن الطلب والتوصيل والاسترجاع وبياناتك.'],
  ['policyKicker','POLICIES','Policy page','Page label','TEXT','POLICY','سياسة'],
  ['effectiveDate','POLICIES','Policy page','Label: Effective date','TEXT','Effective date','تاريخ السريان'],
  ['lastUpdated','POLICIES','Policy page','Label: Last updated','TEXT','Last updated','آخر تحديث'],
  ['onThisPage','POLICIES','Policy page','Contents title','TEXT','On this page','في الصفحة دي'],
  ['relatedPolicies','POLICIES','Policy page','Title: other policies','TEXT','Other policies','سياسات تانية'],
  ['backToPolicies','POLICIES','Policy page','Link: back','TEXT','All policies','كل السياسات'],
  ['policyContactCta','POLICIES','Policy page','Contact box text','LONG','Have a question about this policy? Contact us and include your order number.','عندك سؤال عن السياسة دي؟ كلمنا واكتب رقم الطلب.'],

  /* ---------- VERIFY (authenticity) ---------- */
  ['verifyKicker','VERIFY','Page header','Page label','TEXT','AUTHENTICITY','الأصالة'],
  ['verifyTitle','VERIFY','Page header','Page title','LONG','Verify\nyour piece.','اتأكد\nإن قطعتك أصلية.'],
  ['verifyIntro','VERIFY','Page header','Page text','LONG','Every original TEMPORARY™ piece is registered to its owner with a random serial number. Scan the QR code on your card or type the serial to check it.','كل قطعة أصلية من TEMPORARY™ متسجلة باسم صاحبها برقم سيريال عشوائي. امسح الـ QR اللي على الكارت أو اكتب رقم السيريال عشان تتأكد.'],
  ['verifyPlaceholder','VERIFY','Search box','Box placeholder','TEXT','Enter serial number, e.g. TMP-XXXX-XXXX-XXXX','اكتب رقم السيريال، مثلًا TMP-XXXX-XXXX-XXXX'],
  ['verifyButton','VERIFY','Search box','Button','TEXT','Verify','اتأكد'],
  ['verifyChecking','VERIFY','Search box','Checking message','TEXT','Checking with TEMPORARY™…','بنتأكد من TEMPORARY™…'],
  ['verifyHowTitle','VERIFY','Search box','Help title','TEXT','Where is my serial number?','فين رقم السيريال؟'],
  ['verifyHowBody','VERIFY','Search box','Help text','LONG','It is printed on your TEMPORARY™ card. The same serial stays with you for every order.','مطبوع على كارت TEMPORARY™ بتاعك. ونفس الرقم بيفضل معاك في كل طلب.'],
  ['verifiedTitle','VERIFY','Result','Verified title','TEXT','Verified authentic','أصلي ومتأكد منه'],
  ['verifiedSub','VERIFY','Result','Verified text','LONG','This is an original TEMPORARY™ purchase, registered to its owner.','دي قطعة أصلية من TEMPORARY™، ومتسجلة باسم صاحبها.'],
  ['notVerifiedTitle','VERIFY','Result','Not verified title','TEXT','Not verified','مش أصلي'],
  ['notVerifiedBody','VERIFY','Result','Not verified text','LONG','This code does not belong to an original TEMPORARY™ product. If someone sold you this as original, please contact us.','الكود ده مش تبع أي منتج أصلي من TEMPORARY™. لو حد باعلك القطعة دي على إنها أصلية، كلمنا.'],
  ['inactiveBody','VERIFY','Result','Cancelled card text','LONG','This card is no longer active. Contact TEMPORARY™ with the serial number to check this piece.','الكارت ده مبقاش شغال. كلم TEMPORARY™ برقم السيريال عشان نتأكد من القطعة.'],
  ['scanWarning','VERIFY','Result','Copy warning','LONG','This card has been checked many times. If you are buying this piece second-hand, make sure the design, colour and size match the list below.','الكارت ده اتشيّك عليه كتير. لو بتشتري القطعة مستعملة، اتأكد إن التصميم واللون والمقاس نفس اللي في القايمة تحت.'],
  ['ownedBy','VERIFY','Labels','Owned by','TEXT','Owned by','باسم'],
  ['serialLabel','VERIFY','Labels','Serial number','TEXT','Serial number','رقم السيريال'],
  ['orderLabel','VERIFY','Labels','Order','TEXT','Order','الطلب'],
  ['issuedLabel','VERIFY','Labels','Issued','TEXT','Issued','اتسجل'],
  ['memberSince','VERIFY','Labels','Member since','TEXT','Member since','عضو من'],
  ['piecesLabel','VERIFY','Labels','Pieces','TEXT','Pieces','القطع'],
  ['thisOrder','VERIFY','Labels','Title: designs of this order','TEXT','Pieces in this purchase','القطع اللي في الطلب ده'],
  ['viewCollection','VERIFY','Labels','Button: full collection','TEXT','View full collection','شوف المجموعة كلها'],
  ['collectionTitle','VERIFY','Labels','Collection title ({name} = owner)','TEXT','{name}’s collection','مجموعة {name}'],
  ['collectionSub','VERIFY','Labels','Collection text','LONG','Every original TEMPORARY™ piece registered to this serial.','كل القطع الأصلية من TEMPORARY™ المتسجلة على السيريال ده.'],
  ['cardsTitle','VERIFY','Labels','Title: cards','TEXT','Cards','الكروت'],
  ['copySerial','VERIFY','Labels','Button: copy','TEXT','Copy','انسخ'],
  ['copied','VERIFY','Labels','Copied message','TEXT','Copied','اتنسخ'],
  ['editionOf','VERIFY','Labels','Edition line ({n} = limit)','TEXT','Limited to {n} pieces','محدود بـ {n} قطعة'],
  ['tier_FOUNDER','VERIFY','Tiers','Tier: Founder','TEXT','Founder','فاوندر'],
  ['tier_MEMBER','VERIFY','Tiers','Tier: Member','TEXT','Member','ميمبر'],
  ['tier_CUSTOMER','VERIFY','Tiers','Tier: Customer','TEXT','Customer','عميل'],
  ['authBadge1','VERIFY','Badges','Badge 1','TEXT','Authentic','أصلي'],
  ['authBadge2','VERIFY','Badges','Badge 2','TEXT','Limited edition','إصدار محدود'],
  ['authBadge3','VERIFY','Badges','Badge 3','TEXT','Everything is temporary','كل حاجة مؤقتة'],
  ['authBadge4','VERIFY','Badges','Badge 4','TEXT','Global community','مجتمع عالمي'],

  /* ---------- CONFIRM ---------- */
  ['confirmationPageTitle','CONFIRM','Confirmation page','Title','TEXT','Confirm your order.','أكّد طلبك.'],
  ['confirmationPageCopy','CONFIRM','Confirmation page','Text','TEXT','Review the order below, then confirm it.','راجع الطلب وبعدين أكّده.'],
  ['confirmationPageButton','CONFIRM','Confirmation page','Button: confirm','TEXT','CONFIRM ORDER','تأكيد الطلب'],
  ['confirmationPageShop','CONFIRM','Confirmation page','Button: go to shop','TEXT','GO TO TEMPORARY™','روح لـ TEMPORARY™'],
  ['confirmationConfirmed','CONFIRM','Confirmation page','Status: confirmed','TEXT','ORDER CONFIRMED','الطلب اتأكد'],
  ['confirmationAlready','CONFIRM','Confirmation page','Status: already confirmed','TEXT','ORDER ALREADY CONFIRMED','الطلب متأكد قبل كده'],
  ['confirmationExpired','CONFIRM','Confirmation page','Status: expired','TEXT','THIS CONFIRMATION LINK HAS EXPIRED','رابط التأكيد ده انتهى'],
  ['confirmationInvalid','CONFIRM','Confirmation page','Status: invalid','TEXT','THIS CONFIRMATION LINK IS INVALID','رابط التأكيد ده مش صالح'],

  /* ---------- MESSAGES ---------- */
  ['networkError','MESSAGES','Connection','Connection problem','TEXT','Connection problem. Please retry.','فيه مشكلة في الاتصال. حاول تاني.'],
  ['err_AUTH_REQUIRED','MESSAGES','Errors','Please sign in','TEXT','Please sign in.','ياريت تسجّل دخول.'],
  ['err_SESSION_INVALID','MESSAGES','Errors','Session ended','TEXT','Your session has ended. Please sign in again.','الجلسة خلصت. سجّل دخول تاني.'],
  ['err_SESSION_EXPIRED','MESSAGES','Errors','Session expired','TEXT','Your session has expired. Please sign in again.','الجلسة انتهت. سجّل دخول تاني.'],
  ['err_STORE_CLOSED','MESSAGES','Errors','Store closed','TEXT','The store is closed right now.','المتجر مقفول دلوقتي.'],
  ['err_COD_DISABLED','MESSAGES','Errors','COD unavailable','TEXT','Cash on delivery is currently unavailable.','الدفع عند الاستلام مش متاح دلوقتي.'],
  ['err_CART_EMPTY','MESSAGES','Errors','Bag empty','TEXT','Your bag is empty.','السلة فاضية.'],
  ['err_DESIGN_OUT_OF_STOCK','MESSAGES','Errors','Design sold out','TEXT','This design is sold out.','التصميم ده خلص.'],
  ['err_PRODUCT_NOT_FOUND','MESSAGES','Errors','Product unavailable','TEXT','This product is no longer available.','المنتج ده مبقاش متاح.'],
  ['err_DESIGN_NOT_FOUND','MESSAGES','Errors','Design unavailable','TEXT','This design is no longer available.','التصميم ده مبقاش متاح.'],
  ['err_INVALID_COLOR','MESSAGES','Errors','Colour unavailable','TEXT','That colour is not available.','اللون ده مش متاح.'],
  ['err_INVALID_SIZE','MESSAGES','Errors','Size unavailable','TEXT','That size is not available.','المقاس ده مش متاح.'],
  ['err_QUANTITY_LIMIT_EXCEEDED','MESSAGES','Errors','Quantity limit','TEXT','You have reached the maximum quantity.','وصلت لأقصى كمية مسموحة.'],
  ['err_CHECKOUT_PLACEMENT_NOT_FOUND','MESSAGES','Errors','Combination not available','TEXT','This combination is not available yet.','الاختيار ده مش متاح لسه.'],
  ['err_CUSTOMER_NAME_REQUIRED','MESSAGES','Errors','Name required','TEXT','Please enter your name.','ياريت تكتب اسمك.'],
  ['err_PHONE_INVALID','MESSAGES','Errors','Phone invalid','TEXT','Enter a valid phone number.','اكتب رقم موبايل صحيح.'],
  ['err_EMAIL_INVALID','MESSAGES','Errors','Email invalid','TEXT','Enter a valid email address.','اكتب إيميل صحيح.'],
  ['err_GOVERNORATE_REQUIRED','MESSAGES','Errors','Governorate required','TEXT','Please select your governorate.','ياريت تختار المحافظة.'],
  ['err_AREA_REQUIRED','MESSAGES','Errors','Area required','TEXT','Please enter your area.','ياريت تكتب المنطقة.'],
  ['err_DELIVERY_ADDRESS_REQUIRED','MESSAGES','Errors','Address required','TEXT','Please enter your full address.','ياريت تكتب العنوان بالتفصيل.'],
  ['err_DELIVERY_ADDRESS_TOO_SHORT','MESSAGES','Errors','Address too short','TEXT','Please enter your full address.','ياريت تكتب العنوان بالتفصيل.'],
  ['err_DELIVERY_ZONE_NOT_FOUND','MESSAGES','Errors','Area not delivered','TEXT','We do not deliver to this area yet.','مش بنوصّل للمنطقة دي لسه.'],
  ['err_GOOGLE_CREDENTIAL_INVALID','MESSAGES','Errors','Google sign-in failed','TEXT','Google sign-in failed. Try again.','تسجيل الدخول بـ Google ما نجحش. حاول تاني.'],
  ['err_GOOGLE_TOKEN_EXPIRED','MESSAGES','Errors','Google sign-in expired','TEXT','Google sign-in expired. Try again.','تسجيل الدخول بـ Google انتهى. حاول تاني.'],
  ['err_CONTACT_NAME_REQUIRED','MESSAGES','Errors','Contact: name required','TEXT','Please enter your name.','ياريت تكتب اسمك.'],
  ['err_CONTACT_MESSAGE_REQUIRED','MESSAGES','Errors','Contact: message required','TEXT','Please write your message.','ياريت تكتب رسالتك.'],
  ['err_CONTACT_RATE_LIMITED','MESSAGES','Errors','Contact: too many messages','TEXT','You have sent several messages. Please try again later.','بعت رسايل كتير. حاول تاني بعد شوية.'],
  ['err_SYSTEM_BUSY_RETRY','MESSAGES','Errors','System busy','TEXT','The system is busy. Please try again in a moment.','السيستم عليه ضغط. حاول تاني كمان شوية.'],
  ['err_INTERNAL_ERROR','MESSAGES','Errors','Something went wrong','TEXT','Something went wrong. Please try again.','حصلت مشكلة. حاول تاني.'],

  /* ---------- COLORS (Arabic names; English uses the name from the product sheet unless you fill it) ---------- */
  ['color_black','COLORS','Colour names','Black','TEXT','','أسود'],
  ['color_white','COLORS','Colour names','White','TEXT','','أبيض'],
  ['color_blue','COLORS','Colour names','Blue','TEXT','','أزرق'],
  ['color_light_blue','COLORS','Colour names','Light blue','TEXT','','لبني'],
  ['color_navy','COLORS','Colour names','Navy','TEXT','','كحلي'],
  ['color_hunter_green','COLORS','Colour names','Hunter green','TEXT','','أخضر غامق'],
  ['color_green','COLORS','Colour names','Green','TEXT','','أخضر'],
  ['color_burgundy','COLORS','Colour names','Burgundy','TEXT','','نبيتي'],
  ['color_grey','COLORS','Colour names','Grey','TEXT','','رمادي'],
  ['color_silver','COLORS','Colour names','Silver','TEXT','','فضي'],
  ['color_pink','COLORS','Colour names','Pink','TEXT','','بمبي'],
  ['color_beige','COLORS','Colour names','Beige','TEXT','','بيج'],
  /* ---------- v12: guest checkout · online payment · founders ---------- */
  ['madeToOrder','CUSTOMIZER','Customizer','Made-to-order line','TEXT','Made for you after you order · delivered within 8 working days (Friday & Saturday off).','بتتعمل مخصوص ليك بعد ما تطلب · بتوصلك خلال ٨ أيام عمل (الجمعة والسبت إجازة).'],
  ['chooseSize','CUSTOMIZER','Customizer','Prompt: choose size','TEXT','Choose your size','اختار مقاسك'],
  ['piecesLeft','CUSTOMIZER','Customizer','Pieces left (design)','TEXT','Only {n} left','فاضل {n} بس'],
  ['piecesLeftCard','SHOP','Product card','Pieces left (card)','TEXT','{n} pieces left','فاضل {n} قطعة'],
  ['limitedRun','SHOP','Product card','Limited run label','TEXT','Limited run','كمية محدودة'],
  ['guestCheckoutNote','CHECKOUT','Checkout form','Guest note','TEXT','Checking out as a guest. Sign in with Google to keep your archive.','بتطلب كضيف. سجّل دخول بـ Google عشان تحتفظ بالأرشيف بتاعك.'],
  ['guestSignIn','CHECKOUT','Checkout form','Guest: sign in link','TEXT','Sign in with Google','سجّل دخول بـ Google'],
  ['paySecureNote','CHECKOUT','Checkout form','Secure payment strip','TEXT','Secure payment by Paymob · Visa · Mastercard · Meeza · Wallets','دفع آمن من خلال Paymob · Visa · Mastercard · ميزة · محافظ'],
  ['paymentRedirecting','CHECKOUT','Checkout form','Redirecting to payment','TEXT','Taking you to secure payment…','بنوديك لصفحة الدفع الآمن…'],
  ['emailHint','CHECKOUT','Checkout form','Email hint','TEXT','Your order details are sent to this email.','تفاصيل طلبك هتوصلك على الإيميل ده.'],
  ['deliveryEstimate','CHECKOUT','Checkout form','Delivery estimate','TEXT','Delivery within {n} working days · Friday & Saturday off','التوصيل خلال {n} أيام عمل · الجمعة والسبت إجازة'],
  ['payOkTitle','CHECKOUT','After payment','Paid: title','TEXT','Payment received','الدفع تم'],
  ['payOkBody','CHECKOUT','After payment','Paid: text','LONG','Your order is confirmed. We emailed you the details.','طلبك اتأكد وبعتنالك التفاصيل على الإيميل.'],
  ['payFailTitle','CHECKOUT','After payment','Failed: title','TEXT','Payment not completed','الدفع ما اكتملش'],
  ['payFailBody','CHECKOUT','After payment','Failed: text','LONG','You were not charged. Your order is held for a short time — try again.','مفيش فلوس اتسحبت. طلبك محجوز لفترة قصيرة — جرّب تاني.'],
  ['payRetry','CHECKOUT','After payment','Button: try again','TEXT','Try payment again','جرّب الدفع تاني'],
  ['payPendingTitle','CHECKOUT','After payment','Processing: title','TEXT','Payment processing','الدفع بيتراجع'],
  ['payPendingBody','CHECKOUT','After payment','Processing: text','LONG','We are waiting for the bank to confirm. We will email you as soon as it does.','مستنيين البنك يأكد. هنبعتلك إيميل أول ما يأكد.'],
  ['foundersKicker','CHECKOUT','Founders','Kicker','TEXT','FOUNDERS','FOUNDERS'],
  ['foundersTitle','CHECKOUT','Founders','Title','TEXT','Join the founders.','انضم للـ Founders.'],
  ['foundersBody','CHECKOUT','Founders','Text','LONG','Early access to new drops and a birthday surprise from us.','أول ناس تشوف الدروب الجديدة، ومفاجأة مننا في عيد ميلادك.'],
  ['foundersDob','CHECKOUT','Founders','Field: date of birth','TEXT','Date of birth','تاريخ الميلاد'],
  ['foundersConsent','CHECKOUT','Founders','Consent','TEXT','Send me founders news and offers','ابعتولي أخبار وعروض الـ Founders'],
  ['foundersJoin','CHECKOUT','Founders','Button: join','TEXT','Join','انضم'],
  ['foundersDone','CHECKOUT','Founders','Joined message','TEXT','Welcome to the founders.','أهلًا بيك في الـ Founders.'],
  ['err_PAYMENT_NOT_AVAILABLE','MESSAGES','Errors','Payment unavailable','TEXT','Online payment is not available right now. Please try again later.','الدفع الأونلاين مش متاح دلوقتي. جرّب كمان شوية.'],
  ['err_PAYMENT_START_FAILED','MESSAGES','Errors','Payment page failed','TEXT','We could not open the payment page. Please try again.','معرفناش نفتح صفحة الدفع. جرّب تاني.'],
  ['err_PAYMENT_VERIFY_FAILED','MESSAGES','Errors','Payment not verified','TEXT','We could not verify this payment. If you were charged, contact us with your order number.','معرفناش نتأكد من الدفع ده. لو اتسحب منك فلوس كلمنا ومعاك رقم الطلب.'],
  ['err_PAYMENT_WINDOW_CLOSED','MESSAGES','Errors','Payment window closed','TEXT','The payment window for this order has closed. Please place a new order.','وقت الدفع للطلب ده خلص. اعمل طلب جديد.'],
  ['err_PAYMENT_TOTAL_MISMATCH','MESSAGES','Errors','Total mismatch','TEXT','Order total mismatch. Please try again.','فيه اختلاف في إجمالي الطلب. جرّب تاني.'],
  ['err_DOB_INVALID','MESSAGES','Errors','Date of birth invalid','TEXT','Enter a valid date of birth.','اكتب تاريخ ميلاد صحيح.'],
];

/* =====================================================================
 * PRODUCT SPEC TEMPLATES — material, care and size chart for each product
 * (from the TEMPORARY™ size chart + product details & care guide).
 * Prices are NOT part of the templates.
 * ===================================================================== */
var CARE_ICON_CODES = ['WASH_INSIDE_OUT','BELOW_30','DELICATE','NO_SOFTENER','IRON_INSIDE_OUT','NO_BLEACH','NO_TUMBLE_DRY','LINE_DRY','NO_DRY_CLEAN'];
var STD_CARE = 'WASH_INSIDE_OUT,BELOW_30,DELICATE,NO_SOFTENER,IRON_INSIDE_OUT';
var STD_CONSTRUCTION = ['Side-seamed construction\nDouble-needle stitch','خياطة جانبية\nغرزة مزدوجة'];
var ADULT_REGULAR = [['S',52,69,50,65],['M',54,70,65,75],['L',56,73,75,85],['XL',58,74,85,95],['XXL',60,76,95,105]];
var ADULT_OVERSIZED_TEE = [['S',56,70,55,65],['M',59,72,65,75],['L',62,73,75,85],['XL',65,75,85,95],['XXL',67,77,95,110]];
var ADULT_OVERSIZED_FLEECE = [['S',56,69,50,65],['M',58,70,65,75],['L',62,73,75,85],['XL',64,74,85,95],['XXL',66,76,95,105]];
var SPEC_TEMPLATES = [
  {id:'REGULAR_TSHIRT',name:'Regular T-Shirt',kids:false,aliases:['regular t-shirt','regular tshirt','regular tee','regular t shirt'],
   tagline:['CLEAN ESSENTIAL. ALWAYS RELEVANT.','بيزك نضيف. دايمًا في المود.'],
   material:['100% Parasola Cotton','قطن باراسولا 100%'],lining:['',''],gsm:'180',fit:['Regular Fit','قَصّة عادية'],
   fitNote:['Regular, straight fit. Suitable for a regular everyday fit.','قَصّة عادية ومستقيمة. مناسبة للبس اليومي.'],chart:'WEIGHT',sizes:ADULT_REGULAR},
  {id:'PARASOLA_OVERSIZED',name:'Parasola Oversized',kids:false,aliases:['parasola oversized','parasola oversized t-shirt','parasola oversized tshirt','parasola'],
   tagline:['LIGHTER FEEL. BIGGER ENERGY.','خفيف في اللبس. طاقة أكبر.'],
   material:['100% Parasola Cotton','قطن باراسولا 100%'],lining:['',''],gsm:'180',fit:['Oversized Fit','أوفر سايز'],
   fitNote:['Oversized, loose shoulder and light material suitable for everyday wear.','أوفر سايز، كتف نازل وخامة خفيفة مناسبة للبس اليومي.'],chart:'WEIGHT',sizes:ADULT_OVERSIZED_TEE},
  {id:'BOULEVARD_OVERSIZED',name:'Boulevard Oversized',kids:false,aliases:['boulevard oversized','boulevard oversized t-shirt','boulevard oversized tshirt','boulevard'],
   tagline:['BOLDER FABRIC. BIGGER PRESENCE.','خامة أتقل. حضور أقوى.'],
   material:['100% Boulevard Cotton','قطن بوليفارد 100%'],lining:['',''],gsm:'260',fit:['Oversized Fit','أوفر سايز'],
   fitNote:['Oversized, loose shoulder and heavy material for a premium look.','أوفر سايز، كتف نازل وخامة تقيلة لشكل بريميوم.'],chart:'WEIGHT',sizes:ADULT_OVERSIZED_TEE},
  {id:'REGULAR_LONG_SLEEVE',name:'Regular Long Sleeve',kids:false,aliases:['regular long sleeve','long sleeve','regular longsleeve','longsleeve'],
   tagline:['ESSENTIAL LAYERS. SAME MINDSET.','لبس أساسي. نفس العقلية.'],
   material:['100% Parasola Cotton','قطن باراسولا 100%'],lining:['',''],gsm:'180',fit:['Regular Fit','قَصّة عادية'],
   fitNote:['Regular, straight fit. Suitable for a regular everyday fit.','قَصّة عادية ومستقيمة. مناسبة للبس اليومي.'],chart:'WEIGHT',sizes:ADULT_REGULAR},
  {id:'PREMIUM_OVERSIZED_CREWNECK',name:'Premium Oversized Crewneck',kids:false,aliases:['premium oversized crewneck','premium crewneck','oversized crewneck','crewneck','sweatshirt'],
   tagline:['ELEVATED COMFORT. TIMELESS LOOK.','راحة أعلى. شكل ما بيقدمش.'],
   material:['100% Melton Cotton','قطن ميلتون 100%'],lining:['Internal Cotton Fleece','فليس قطن من جوه'],gsm:'380',fit:['Oversized Fit','أوفر سايز'],
   fitNote:['Oversized, loose fit. Comfy inside out with a premium look.','أوفر سايز وقَصّة واسعة. مريح من جوه ومن بره وشكله بريميوم.'],chart:'WEIGHT',sizes:ADULT_OVERSIZED_FLEECE},
  {id:'STANDARD_OVERSIZED_HOODIE',name:'Standard Oversized Hoodie',kids:false,aliases:['standard oversized hoodie','standard hoodie','classic hoodie'],
   tagline:['EVERYDAY OVERSIZED. ALWAYS A GOOD CALL.','أوفر سايز لكل يوم. دايمًا اختيار صح.'],
   material:['70% Cotton – 30% Polyester','70% قطن – 30% بوليستر'],lining:['Internal Cotton Fleece','فليس قطن من جوه'],gsm:'310',fit:['Oversized Fit','أوفر سايز'],
   fitNote:['Oversized, loose fit. Suitable for economical use and events.','أوفر سايز وقَصّة واسعة. مناسب للاستخدام الاقتصادي والإيفنتات.'],chart:'WEIGHT',sizes:ADULT_OVERSIZED_FLEECE},
  {id:'PREMIUM_OVERSIZED_HOODIE',name:'Premium Oversized Hoodie',kids:false,aliases:['premium oversized hoodie','premium hoodie'],
   tagline:['MAXIMUM COMFORT. BUILT DIFFERENT.','أقصى راحة. معمول بشكل مختلف.'],
   material:['100% Melton Cotton','قطن ميلتون 100%'],lining:['Internal Cotton Fleece','فليس قطن من جوه'],gsm:'380',fit:['Oversized Fit','أوفر سايز'],
   fitNote:['Oversized, loose fit. Comfy from inside out with a premium look.','أوفر سايز وقَصّة واسعة. مريح من جوه ومن بره وشكله بريميوم.'],chart:'WEIGHT',sizes:ADULT_OVERSIZED_FLEECE},
  {id:'KIDS_REGULAR_TSHIRT',name:'Kids Regular T-Shirt',kids:true,aliases:['kids regular t-shirt','kids regular tshirt','kids t-shirt','kids tshirt','kids tee'],
   tagline:['SMALL PIECES. BIG ATTITUDE.','قطع صغيرة. شخصية كبيرة.'],
   material:['100% Parasola Cotton','قطن باراسولا 100%'],lining:['',''],gsm:'180',fit:['Regular Fit','قَصّة عادية'],
   fitNote:['Regular and light material suitable for kids.','قَصّة عادية وخامة خفيفة مناسبة للأطفال.'],chart:'AGE',
   sizes:[['4 YRS',33,45,3,4],['6 YRS',35,47,4,6],['8 YRS',37,50,6,8],['10 YRS',39,53,8,10],['12 YRS',42,57,10,12]]},
  {id:'KIDS_REGULAR_HOODIE',name:'Kids Regular Hoodie',kids:true,aliases:['kids regular hoodie','kids hoodie'],
   tagline:['NEXT GENERATION. SAME MINDSET.','جيل جديد. نفس العقلية.'],
   material:['100% Melton Cotton','قطن ميلتون 100%'],lining:['Internal Cotton Fleece','فليس قطن من جوه'],gsm:'380',fit:['Regular Fit','قَصّة عادية'],
   fitNote:['Regular fit. Cotton inside out with a plush inside for a comfy, warm feel.','قَصّة عادية. قطن من بره ومن جوه ناعم ودافي عشان يريّح ويدفّي.'],chart:'AGE',
   sizes:[['4 YRS',38,44,3,4],['6 YRS',39,46,4,6],['8 YRS',40,50,6,8],['10 YRS',41,53,8,10],['12 YRS',42,56,10,12]]}
];

/* =====================================================================
 * POLICIES — copied into POLICIES + POLICY_SECTIONS once (only if the policy does not exist yet).
 * Body format: blank line = new paragraph · "- " = bullet · "1. " = numbered · **bold**
 * ===================================================================== */
var SEED_POLICIES = [
 {
  "policyId": "returns",
  "slug": "returns",
  "order": 1,
  "titleEn": "Returns, Exchanges & Product Defects Policy",
  "titleAr": "سياسة الاسترجاع والاستبدال وعيوب المنتجات",
  "subtitleEn": "Returns, exchanges, defects and refunds",
  "subtitleAr": "الاسترجاع والاستبدال والعيوب ورد المبالغ",
  "effectiveEn": "October 2026",
  "effectiveAr": "أكتوبر 2026",
  "introEn": "TEMPORARY™ is a limited-edition clothing brand that operates through drops and collections produced in limited quantities and according to defined production and preparation processes.\n\nEvery order is handled through defined procedures for production, quality control, preparation, packaging and fulfilment.\n\nBecause of the limited nature of TEMPORARY™ products, all return requests, exchange requests and product quality complaints are handled according to the structured procedures set out in this policy.\n\nThis policy is applied in accordance with applicable Egyptian law. Nothing in this policy is intended to cancel, restrict or waive any mandatory consumer right that cannot legally be excluded or restricted.",
  "introAr": "TEMPORARY™ هي علامة تجارية للملابس ذات الإصدارات المحدودة، وتعمل من خلال إصدارات ومجموعات يتم إنتاجها بكميات محدودة ووفق عمليات إنتاج وتجهيز محددة.\n\nتتم معالجة كل طلب من خلال إجراءات محددة للإنتاج، ومراقبة الجودة، والتجهيز، والتغليف والتنفيذ.\n\nونظرًا للطبيعة المحدودة لمنتجات TEMPORARY™، تتم معالجة جميع طلبات الاسترجاع والاستبدال وشكاوى جودة المنتجات وفقًا للإجراءات المنظمة الموضحة في هذه السياسة.\n\nتُطبق هذه السياسة بما يتوافق مع القوانين المصرية السارية. ولا تهدف أي مادة في هذه السياسة إلى إلغاء أو تقييد أو التنازل عن أي حق إلزامي للمستهلك لا يجوز قانونًا استبعاده أو تقييده.",
  "closingEn": "**Limited by design.**\n**Organized by process.**\n**EVERYTHING IS TEMPORARY.**",
  "closingAr": "**محدودة بتصميمها.**\n**منظمة بإجراءاتها.**\n**EVERYTHING IS TEMPORARY.**",
  "sections": [
   {
    "number": "01",
    "titleEn": "Scope of This Policy",
    "titleAr": "نطاق هذه السياسة",
    "bodyEn": "This policy applies to purchases made directly from TEMPORARY™ through its official ordering channels.\n\nIt covers:\n\n- Returns\n- Exchanges\n- Defective products\n- Products that do not match the confirmed order\n- Customer selection errors\n- Product condition requirements\n- Approval of return requests\n- Product inspection\n- Refund processing\n- Limited-edition products\n- Shipping and collection related to returns\n\nThis policy should be read together with the TEMPORARY™ Terms & Conditions, Shipping & Delivery Policy, Privacy Policy and the product care instructions.",
    "bodyAr": "تسري هذه السياسة على المشتريات التي تتم مباشرة من TEMPORARY™ من خلال قنوات الطلب الرسمية التابعة لها.\n\nوتشمل:\n\n- الاسترجاع\n- الاستبدال\n- المنتجات المعيبة\n- المنتجات غير المطابقة للطلب المؤكد\n- أخطاء اختيار العميل\n- شروط حالة المنتج\n- اعتماد طلبات الاسترجاع\n- فحص المنتجات\n- معالجة المبالغ المستردة\n- المنتجات ذات الإصدارات المحدودة\n- الشحن والاستلام المرتبط بعمليات الاسترجاع\n\nوتُقرأ هذه السياسة مع شروط وأحكام TEMPORARY™، وسياسة الشحن والتوصيل، وسياسة الخصوصية، وتعليمات العناية بالمنتج."
   },
   {
    "number": "02",
    "titleEn": "Before Confirming Your Order",
    "titleAr": "قبل تأكيد الطلب",
    "bodyEn": "The customer is responsible for reviewing the order details before confirming the order.\n\nThis includes:\n\n- Product\n- Design\n- Size\n- Colour\n- Quantity\n- Customer name\n- Phone number\n- Email address\n- Delivery address\n\nWe strongly recommend that customers review the applicable size information and product details before confirming an order.\n\nOnce an order is confirmed, TEMPORARY™ may begin processing, production and fulfilment.",
    "bodyAr": "يتحمل العميل مسؤولية مراجعة بيانات طلبه قبل تأكيده.\n\nويشمل ذلك:\n\n- المنتج\n- التصميم\n- المقاس\n- اللون\n- الكمية\n- اسم العميل\n- رقم الهاتف\n- البريد الإلكتروني\n- عنوان التوصيل\n\nننصح العميل بشدة بمراجعة معلومات المقاسات وتفاصيل المنتج المعمول بها قبل تأكيد الطلب.\n\nوبمجرد تأكيد الطلب، يجوز لـ TEMPORARY™ البدء في إجراءات المعالجة والإنتاج والتنفيذ."
   },
   {
    "number": "03",
    "titleEn": "Order Changes and Cancellation",
    "titleAr": "تعديل الطلب وإلغاؤه",
    "bodyEn": "The customer may contact TEMPORARY™ to request a change to, or cancellation of, an order after it has been placed.\n\nTEMPORARY™ will determine whether the order has already entered production, preparation, packaging or shipping.\n\nWhere this is operationally possible, TEMPORARY™ may accept the change or cancellation request.\n\nHowever, submitting a cancellation request does not mean it is automatically approved.\n\nOnce an order reaches a stage where a change or cancellation is no longer reasonably possible, TEMPORARY™ may be unable to make the requested change, subject to any mandatory rights provided by law.",
    "bodyAr": "يجوز للعميل التواصل مع TEMPORARY™ لطلب تعديل الطلب أو إلغائه بعد إتمامه.\n\nوستحدد TEMPORARY™ ما إذا كان الطلب قد دخل بالفعل في مرحلة الإنتاج أو التجهيز أو التغليف أو الشحن.\n\nوفي حال كان ذلك ممكنًا من الناحية التشغيلية، يجوز لـ TEMPORARY™ قبول طلب التعديل أو الإلغاء.\n\nومع ذلك، فإن تقديم طلب الإلغاء لا يعني الموافقة عليه تلقائيًا.\n\nوبمجرد وصول الطلب إلى مرحلة لا يكون فيها التعديل أو الإلغاء ممكنًا بشكل معقول، قد لا تتمكن TEMPORARY™ من تنفيذ التعديل المطلوب، وذلك مع مراعاة أي حقوق إلزامية مقررة بموجب القانون."
   },
   {
    "number": "04",
    "titleEn": "Legal Return and Exchange Period",
    "titleAr": "المدة القانونية للاسترجاع والاستبدال",
    "bodyEn": "Where the legal right applies, Egyptian consumer protection rules give the consumer the right to exchange or return a product **within 14 days of receiving it, without giving a reason**, subject to the exceptions set out in the law.\n\nTEMPORARY™ complies with the applicable legal period.\n\nThe date the product was delivered or received is used to determine the applicable legal period.\n\nCustomers should contact TEMPORARY™ through the official support channel as soon as possible when exercising their right to return or exchange.",
    "bodyAr": "في الحالات التي ينطبق فيها الحق القانوني، تمنح قواعد حماية المستهلك المصرية المستهلك الحق في استبدال المنتج أو إعادته خلال **14 يومًا من تاريخ استلامه دون إبداء أسباب**، مع مراعاة الاستثناءات المنصوص عليها قانونًا.\n\nوتلتزم TEMPORARY™ بالمدة القانونية واجبة التطبيق.\n\nويُعتد بتاريخ تسليم أو استلام المنتج عند تحديد المدة القانونية المعمول بها.\n\nوينبغي على العميل التواصل مع TEMPORARY™ من خلال قناة الدعم الرسمية في أقرب وقت ممكن عند ممارسة حقه في الاسترجاع أو الاستبدال."
   },
   {
    "number": "05",
    "titleEn": "How to Request a Return from TEMPORARY™",
    "titleAr": "إجراءات طلب الاسترجاع لدى TEMPORARY™",
    "bodyEn": "All customers must contact TEMPORARY™ before arranging the return of any product.\n\nThe customer must provide:\n\n- Order number\n- Full name\n- Phone number\n- The product concerned\n- The reason for contacting TEMPORARY™, where applicable\n- Photos or video when reasonably requested\n\nTEMPORARY™ may verify the order details and provide the customer with the appropriate return instructions.\n\n**The customer must not send the product to any address, employee, supplier, warehouse or other party unless directed to do so by TEMPORARY™.**\n\nThese procedures allow TEMPORARY™ to identify the order, document the request and organise the proper handling of the product.\n\nFailure to contact TEMPORARY™ before sending a product may cause logistical delays; however, this administrative procedure does not cancel any legal right that applies to the customer.",
    "bodyAr": "يجب على جميع العملاء التواصل مع TEMPORARY™ قبل ترتيب إعادة أي منتج.\n\nويجب على العميل تقديم:\n\n- رقم الطلب\n- الاسم الكامل\n- رقم الهاتف\n- المنتج المعني\n- سبب التواصل مع TEMPORARY™، متى كان ذلك منطبقًا\n- الصور أو الفيديو عند طلبها بشكل معقول\n\nيجوز لـ TEMPORARY™ التحقق من بيانات الطلب وتزويد العميل بتعليمات الإرجاع المناسبة.\n\n**يجب على العميل عدم إرسال المنتج إلى أي عنوان أو موظف أو مورد أو مخزن أو جهة أخرى ما لم يتم توجيهه من قبل TEMPORARY™.**\n\nوتهدف هذه الإجراءات إلى تمكين TEMPORARY™ من تحديد الطلب، وتوثيق الطلب، وتنظيم التعامل المناسب مع المنتج.\n\nوقد يؤدي عدم تواصل العميل مع TEMPORARY™ قبل إرسال المنتج إلى تأخيرات لوجستية، إلا أن هذا الإجراء الإداري لا يلغي أي حق قانوني ينطبق على العميل."
   },
   {
    "number": "06",
    "titleEn": "Product Condition",
    "titleAr": "حالة المنتج",
    "bodyEn": "Where the law permits conditions relating to product condition, the product must remain in the condition required by law for the return or exchange concerned.\n\nTEMPORARY™ may inspect the product after it is returned.\n\nWhere applicable, the product must be:\n\n- Unwashed\n- Not altered or modified\n- Free from stains\n- Free from traces of cosmetics\n- Free from chemical contamination\n- Free from any modifications made by the customer\n- Free from damage caused by the customer\n- Accompanied by its tags or labels, where applicable\n- In substantially the same condition as when it was delivered\n\nTEMPORARY™ may document the condition of returned products during inspection.\n\nIf the product is not in the condition required by law because of an act attributable to the customer, TEMPORARY™ may rely on the applicable legal exception.",
    "bodyAr": "عندما يسمح القانون بتطبيق شروط تتعلق بحالة المنتج، يجب أن يظل المنتج بالحالة المطلوبة قانونًا بالنسبة لعملية الاسترجاع أو الاستبدال المعنية.\n\nيجوز لـ TEMPORARY™ فحص المنتج بعد إعادته.\n\nوعند الاقتضاء، يجب أن يظل المنتج:\n\n- غير مغسول\n- غير معدل أو مغيّر\n- خاليًا من البقع\n- خاليًا من آثار مستحضرات التجميل\n- خاليًا من التلوث بالمواد الكيميائية\n- خاليًا من أي تعديلات قام بها العميل\n- خاليًا من التلف الناتج عن العميل\n- مصحوبًا بالبطاقات أو العلامات التعريفية الخاصة به، عند الاقتضاء\n- في حالة مماثلة جوهريًا للحالة التي تم تسليمه بها\n\nيجوز لـ TEMPORARY™ توثيق حالة المنتجات المرتجعة أثناء الفحص.\n\nوفي حال لم يعد المنتج بالحالة التي يوجبها القانون بسبب فعل منسوب إلى العميل، يجوز لـ TEMPORARY™ الاستناد إلى الاستثناء القانوني المنطبق."
   },
   {
    "number": "07",
    "titleEn": "Legal Exceptions",
    "titleAr": "الاستثناءات القانونية",
    "bodyEn": "The legal right to return or exchange within 14 days is subject to the exceptions set out in Egyptian law.\n\nThese exceptions include cases where:\n\n1. The nature, characteristics, packing or packaging of the goods has changed without being exchanged or returned, or it is impossible to restore them to the condition they were in at the time of contracting;\n2. The goods are perishable consumer goods;\n3. The goods are not in the condition they were in at the time of sale for a reason attributable to the consumer;\n4. The goods were made according to special specifications set by the consumer and conform to those specifications;\n5. The goods fall within another category expressly excluded by law.\n\nTEMPORARY™ will apply these exceptions only where they genuinely apply to the product and circumstances concerned.\n\n**TEMPORARY™ does not treat every limited-edition product as automatically exempt from the legal right of return.**",
    "bodyAr": "يخضع الحق القانوني في الاسترجاع أو الاستبدال خلال 14 يومًا للاستثناءات المنصوص عليها في القانون المصري.\n\nوتشمل هذه الاستثناءات الحالات التي:\n\n1. تحول فيها طبيعة السلعة أو خصائصها أو طريقة تعبئتها أو تغليفها دون استبدالها أو ردها، أو يستحيل معها إعادتها إلى الحالة التي كانت عليها وقت التعاقد؛\n2. تكون فيها السلعة من السلع الاستهلاكية سريعة التلف؛\n3. لا تكون فيها السلعة بالحالة التي كانت عليها وقت البيع بسبب يرجع إلى المستهلك؛\n4. تكون فيها السلعة مصنعة بناءً على مواصفات خاصة حددها المستهلك وتكون السلعة مطابقة لهذه المواصفات؛\n5. تكون فيها السلعة ضمن فئة أخرى مستثناة صراحة بموجب القانون.\n\nوستطبق TEMPORARY™ هذه الاستثناءات فقط عندما تكون منطبقة بالفعل على المنتج والظروف المعنية.\n\n**ولا تعتبر TEMPORARY™ كل منتج محدود الإصدار معفيًا تلقائيًا من حق الاسترجاع القانوني.**"
   },
   {
    "number": "08",
    "titleEn": "Limited-Edition Products",
    "titleAr": "المنتجات ذات الإصدارات المحدودة",
    "bodyEn": "TEMPORARY™ products may be produced in limited quantities and may not be reproduced or restocked.\n\nLimited quantity does not, on its own, cancel any legal consumer right.\n\nHowever, where an exchange applies and a matching product is not available, TEMPORARY™ will provide the remedy required by law rather than guarantee that another identical limited-edition piece can be made.\n\nTEMPORARY™ is not obliged to create additional stock simply to reproduce an unavailable limited-edition product, unless the law requires it to do so.",
    "bodyAr": "قد يتم إنتاج منتجات TEMPORARY™ بكميات محدودة وقد لا تتم إعادة إنتاجها أو تخزينها مرة أخرى.\n\nولا تؤدي محدودية الكمية، في حد ذاتها، إلى إلغاء أي حق قانوني للمستهلك.\n\nومع ذلك، عندما يكون الاستبدال واجب التطبيق ويكون المنتج المطابق غير متوفر، ستقدم TEMPORARY™ المعالجة التي يوجبها القانون بدلًا من ضمان إمكانية تصنيع قطعة أخرى مطابقة من الإصدار المحدود.\n\nولا تلتزم TEMPORARY™ بإنشاء مخزون إضافي لمجرد إعادة إنتاج منتج محدود الإصدار غير متوفر، ما لم يكن القانون يلزمها بذلك."
   },
   {
    "number": "09",
    "titleEn": "Customer Selection Errors",
    "titleAr": "أخطاء اختيار العميل",
    "bodyEn": "The customer is responsible for reviewing:\n\n- Product\n- Design\n- Size\n- Colour\n- Quantity\n\nbefore confirming the order.\n\nIf TEMPORARY™ delivers the product specified in the confirmed order, the customer's later preference or a selection error is not automatically considered a manufacturing defect.\n\nWhere a legal right of return applies, TEMPORARY™ will handle the request in accordance with that right.\n\nIf the customer requests an exchange or a solution beyond the applicable legal obligation, TEMPORARY™ may decide whether that optional solution is available.",
    "bodyAr": "يتحمل العميل مسؤولية مراجعة:\n\n- المنتج\n- التصميم\n- المقاس\n- اللون\n- الكمية\n\nقبل تأكيد الطلب.\n\nإذا قامت TEMPORARY™ بتسليم المنتج المحدد في الطلب المؤكد، فإن تفضيل العميل اللاحق أو خطأ الاختيار لا يعتبر تلقائيًا عيبًا في التصنيع.\n\nوفي الحالات التي ينطبق فيها حق قانوني في الاسترجاع، ستتعامل TEMPORARY™ مع الطلب وفقًا لذلك الحق.\n\nأما إذا طلب العميل استبدالًا أو حلًا يتجاوز الالتزام القانوني المطبق، فيجوز لـ TEMPORARY™ تحديد ما إذا كان هذا الحل الاختياري متاحًا."
   },
   {
    "number": "10",
    "titleEn": "Size Selection",
    "titleAr": "اختيار المقاس",
    "bodyEn": "The customer must use the applicable TEMPORARY™ size information before ordering.\n\nIf the delivered product matches the size the customer selected, the customer's later wish for another size does not mean that TEMPORARY™ delivered the wrong product.\n\nWhere a legal right of return or exchange applies, the request will be handled according to the applicable legal framework.\n\nAny optional size exchange outside the mandatory legal obligation is subject to product availability and TEMPORARY™ procedures.",
    "bodyAr": "يجب على العميل استخدام معلومات المقاسات المعمول بها لدى TEMPORARY™ قبل الطلب.\n\nإذا كان المنتج المسلم مطابقًا للمقاس الذي اختاره العميل، فإن رغبة العميل اللاحقة في مقاس آخر لا تعني أن TEMPORARY™ قامت بتسليم منتج خاطئ.\n\nوفي الحالات التي ينطبق فيها حق قانوني في الاسترجاع أو الاستبدال، تتم معالجة الطلب وفقًا للإطار القانوني المعمول به.\n\nوأي استبدال اختياري للمقاس خارج الالتزام القانوني الإلزامي يخضع لتوافر المنتج والإجراءات المعمول بها لدى TEMPORARY™."
   },
   {
    "number": "11",
    "titleEn": "Colour Selection",
    "titleAr": "اختيار اللون",
    "bodyEn": "The customer must review the available product colours before confirming the order.\n\nIf TEMPORARY™ delivers the colour the customer selected in the confirmed order, the customer's later wish for another colour is not considered a wrong delivery.\n\nAny optional colour exchange is subject to applicable law and product availability.",
    "bodyAr": "يجب على العميل مراجعة ألوان المنتج المتاحة قبل تأكيد الطلب.\n\nإذا قامت TEMPORARY™ بتسليم اللون الذي اختاره العميل في الطلب المؤكد، فإن رغبة العميل اللاحقة في لون آخر لا تعتبر تسليمًا خاطئًا.\n\nوأي استبدال اختياري للون يخضع للقانون المعمول به وتوافر المنتج."
   },
   {
    "number": "12",
    "titleEn": "Wrong Product or Wrong Order",
    "titleAr": "المنتج أو الطلب الخاطئ",
    "bodyEn": "If TEMPORARY™ delivers a product that does not match the confirmed order, the customer must contact TEMPORARY™.\n\nTEMPORARY™ may request:\n\n- Order number\n- Photos of the product\n- Photos of the product tag or label\n- Photos of the packaging\n- A video where needed\n\nTEMPORARY™ will examine the difference and provide the remedy required by law.",
    "bodyAr": "إذا قامت TEMPORARY™ بتسليم منتج لا يتطابق مع الطلب المؤكد، يجب على العميل التواصل مع TEMPORARY™.\n\nيجوز لـ TEMPORARY™ طلب:\n\n- رقم الطلب\n- صور المنتج\n- صور بطاقة أو ملصق المنتج\n- صور التغليف\n- فيديو عند الحاجة\n\nوستقوم TEMPORARY™ بفحص الاختلاف وتقديم المعالجة الواجبة وفقًا للقانون."
   },
   {
    "number": "13",
    "titleEn": "Defective Products",
    "titleAr": "المنتجات المعيبة",
    "bodyEn": "A product may be considered defective when it has a shortfall in its value or usefulness that prevents the consumer, fully or partly, from using it for its intended purpose, provided that the consumer is not responsible for the problem.\n\nIf the customer believes a product is defective, they must contact TEMPORARY™ and explain the alleged defect.",
    "bodyAr": "قد يعتبر المنتج معيبًا عندما يوجد به نقص في قيمته أو منفعته يمنع المستهلك كليًا أو جزئيًا من الانتفاع به للغرض الذي أُعد من أجله، بشرط ألا يكون المستهلك مسؤولًا عن المشكلة.\n\nإذا اعتقد العميل أن المنتج معيب، فيجب عليه التواصل مع TEMPORARY™ وتوضيح العيب المزعوم."
   },
   {
    "number": "14",
    "titleEn": "Information Required to Review a Defect",
    "titleAr": "بيانات طلب فحص العيب",
    "bodyEn": "For defect complaints, TEMPORARY™ may request:\n\n- Order number\n- Customer name\n- Phone number\n- Clear photos\n- A clear video where needed\n- Photos of the product tag or label\n- Photos of the packaging where needed\n- A description of the alleged defect\n- Information about how the product was used or cared for\n\nThe customer must provide accurate information.\n\nProviding false, misleading or materially incomplete information may affect the assessment of the request, to the extent permitted by law.",
    "bodyAr": "بالنسبة لشكاوى العيوب، يجوز لـ TEMPORARY™ طلب:\n\n- رقم الطلب\n- اسم العميل\n- رقم الهاتف\n- صور واضحة\n- فيديو واضح عند الحاجة\n- صور بطاقة أو ملصق المنتج\n- صور التغليف عند الحاجة\n- وصف العيب المزعوم\n- معلومات عن كيفية استخدام المنتج أو العناية به\n\nويجب على العميل تقديم معلومات صحيحة.\n\nوقد يؤثر تقديم معلومات كاذبة أو مضللة أو ناقصة بشكل جوهري على تقييم الطلب، بالقدر الذي يسمح به القانون."
   },
   {
    "number": "15",
    "titleEn": "Defect Inspection",
    "titleAr": "فحص العيب",
    "bodyEn": "The customer is not required to determine whether a product is legally \"defective\".\n\nThe customer only needs to explain the problem and provide the information reasonably needed so that TEMPORARY™ can examine it.\n\nTEMPORARY™ may inspect the product and review:\n\n- Product specifications\n- Order details\n- Production details\n- Printing details\n- Embroidery details\n- Product tags\n- Quality control records\n- Packaging records\n- Delivery details\n- Photos and video\n- The physical product\n\nTEMPORARY™ may use information from the relevant factory or production party as part of its internal inspection process.",
    "bodyAr": "لا يُطلب من العميل تحديد ما إذا كان المنتج \"معيبًا\" من الناحية القانونية.\n\nوعليه فقط توضيح المشكلة وتقديم المعلومات اللازمة بشكل معقول حتى تتمكن TEMPORARY™ من فحصها.\n\nيجوز لـ TEMPORARY™ فحص المنتج ومراجعة:\n\n- مواصفات المنتج\n- بيانات الطلب\n- بيانات الإنتاج\n- بيانات الطباعة\n- بيانات التطريز\n- بطاقات المنتج\n- سجلات مراقبة الجودة\n- سجلات التغليف\n- بيانات التوصيل\n- الصور والفيديو\n- المنتج الفعلي\n\nويجوز لـ TEMPORARY™ الاستعانة بالمعلومات الواردة من المصنع أو جهة الإنتاج ذات الصلة كجزء من عملية الفحص الداخلية."
   },
   {
    "number": "16",
    "titleEn": "Factory / Production Review",
    "titleAr": "مراجعة المصنع / جهة الإنتاج",
    "bodyEn": "Where the nature of the alleged defect requires a technical assessment, TEMPORARY™ may refer to the relevant factory, printing or embroidery party, production facility or responsible production party.\n\nThis may be necessary to determine whether the problem was caused by:\n\n- Manufacturing\n- Printing\n- Embroidery\n- Fabric production\n- Packaging\n- Transport\n- Customer use\n- Customer care of the product\n- Modification\n- Natural characteristics of the product\n- Another identifiable cause\n\nTEMPORARY™ may ask for the physical product to be made available for inspection where reasonably necessary.\n\n**Factory or production review is an internal assessment procedure and does not transfer TEMPORARY™'s legal obligations to the factory.**\n\nWhere the law sets a mandatory remedy or period for a confirmed defect, TEMPORARY™ will comply with it.",
    "bodyAr": "عندما تتطلب طبيعة العيب المزعوم تقييمًا فنيًا، يجوز لـ TEMPORARY™ الرجوع إلى المصنع أو جهة الطباعة أو التطريز أو منشأة الإنتاج أو جهة الإنتاج المسؤولة ذات الصلة.\n\nوقد يكون ذلك ضروريًا لتحديد ما إذا كانت المشكلة ناتجة عن:\n\n- التصنيع\n- الطباعة\n- التطريز\n- إنتاج الخامة\n- التغليف\n- النقل\n- استخدام العميل\n- عناية العميل بالمنتج\n- التعديل\n- الخصائص الطبيعية للمنتج\n- سبب آخر يمكن تحديده\n\nويجوز لـ TEMPORARY™ طلب إتاحة المنتج الفعلي للفحص عندما يكون ذلك ضروريًا بشكل معقول.\n\n**تُعد مراجعة المصنع أو جهة الإنتاج إجراءً داخليًا للتقييم ولا تنقل الالتزامات القانونية الخاصة بـ TEMPORARY™ إلى المصنع.**\n\nوعندما يحدد القانون علاجًا أو مدة إلزامية فيما يتعلق بعيب مؤكد، تلتزم TEMPORARY™ بذلك."
   },
   {
    "number": "17",
    "titleEn": "Legal Period for Defective Products",
    "titleAr": "المدة القانونية للمنتج المعيب",
    "bodyEn": "For products to which the legal framework for defective products applies, the customer may have **30 days from the date of receipt** to exercise the applicable legal rights.\n\nFor a product that is proven to be defective and to which the legal framework applies, TEMPORARY™ will provide the remedy required by law, including exchange or refund where required, and will handle the related costs in accordance with the law.\n\nWhere the law sets a specific period for the supplier to carry out the required remedy, TEMPORARY™ will comply with that period.\n\nTEMPORARY™ does not use factory review as a reason to postpone a legally required remedy indefinitely.",
    "bodyAr": "بالنسبة للمنتجات التي ينطبق عليها الإطار القانوني الخاص بالمنتجات المعيبة، قد يكون لدى العميل **مدة 30 يومًا من تاريخ الاستلام** لممارسة الحقوق القانونية المنطبقة.\n\nوبالنسبة للمنتج الذي يثبت وجود عيب فيه وينطبق عليه الإطار القانوني، ستقدم TEMPORARY™ المعالجة التي يوجبها القانون، بما في ذلك الاستبدال أو رد المبلغ عند وجوبه والتعامل مع التكاليف المرتبطة وفقًا للقانون.\n\nوعندما يحدد القانون مدة محددة لتنفيذ المورد للمعالجة المطلوبة، تلتزم TEMPORARY™ بهذه المدة.\n\nولا تستخدم TEMPORARY™ الرجوع إلى المصنع كسبب لتأجيل معالجة واجبة قانونًا إلى أجل غير محدد."
   },
   {
    "number": "18",
    "titleEn": "Damage Caused by the Customer",
    "titleAr": "التلف الناتج عن العميل",
    "bodyEn": "TEMPORARY™ is not responsible for damage caused by the customer where the law allows this responsibility to be excluded.\n\nThis includes, for example:\n\n- Incorrect washing\n- Incorrect drying\n- Incorrect ironing\n- Use of bleach\n- Exposure to chemicals\n- Exposure to excessive heat\n- Tearing\n- Cutting\n- Alteration\n- Tailoring or sewing after purchase\n- Unauthorised printing\n- Unauthorised embroidery\n- Stains\n- Burns\n- Intentional damage\n- Incorrect storage\n- Misuse\n\nThe customer must follow the care instructions provided with the product.",
    "bodyAr": "لا تتحمل TEMPORARY™ مسؤولية التلف الناتج عن العميل في الحالات التي يسمح فيها القانون باستبعاد هذه المسؤولية.\n\nويشمل ذلك، على سبيل المثال:\n\n- الغسيل بطريقة غير صحيحة\n- التجفيف بطريقة غير صحيحة\n- الكي بطريقة غير صحيحة\n- استخدام مواد التبييض\n- التعرض للمواد الكيميائية\n- التعرض للحرارة المفرطة\n- التمزق\n- القطع\n- التعديل\n- التفصيل أو الخياطة بعد الشراء\n- الطباعة غير المصرح بها\n- التطريز غير المصرح به\n- البقع\n- الحرق\n- التلف المتعمد\n- التخزين غير الصحيح\n- سوء الاستخدام\n\nويجب على العميل اتباع تعليمات العناية المرفقة بالمنتج."
   },
   {
    "number": "19",
    "titleEn": "Normal Wear and Product Characteristics",
    "titleAr": "الاستهلاك الطبيعي وخصائص المنتج",
    "bodyEn": "Normal wear or wear resulting from ordinary use is not automatically considered a manufacturing defect.\n\nNatural characteristics associated with clothing, printing, embroidery or the production process are not automatically considered defects either.\n\nTEMPORARY™ will assess the problem and the actual circumstances of each case.\n\nThis section is not intended to exclude any genuine legal right relating to a defective product.",
    "bodyAr": "لا يعتبر الاستهلاك الطبيعي أو التلف الناتج عن الاستخدام العادي عيبًا في التصنيع تلقائيًا.\n\nكما أن الخصائص الطبيعية المرتبطة بالملابس أو الطباعة أو التطريز أو عملية الإنتاج لا تعتبر عيبًا تلقائيًا.\n\nستقوم TEMPORARY™ بتقييم المشكلة والظروف الفعلية لكل حالة.\n\nولا يهدف هذا البند إلى استبعاد أي حق قانوني حقيقي متعلق بمنتج معيب."
   },
   {
    "number": "20",
    "titleEn": "Product Care",
    "titleAr": "العناية بالمنتج",
    "bodyEn": "The customer is responsible for following the care instructions provided with the product.\n\nIncorrect care may damage:\n\n- The fabric\n- The print\n- The embroidery\n- Tags or labels\n- The garment structure\n- The colour\n- The outer finish\n\nWhere damage results from customer misuse or incorrect care, TEMPORARY™ may rely on the legal rules relating to damage caused by the consumer.",
    "bodyAr": "يتحمل العميل مسؤولية اتباع تعليمات العناية المرفقة بالمنتج.\n\nوقد تؤدي العناية غير الصحيحة إلى تلف:\n\n- القماش\n- الطباعة\n- التطريز\n- البطاقات أو الملصقات\n- هيكل القطعة\n- اللون\n- التشطيب الخارجي\n\nوعندما يكون التلف ناتجًا عن سوء استخدام العميل أو العناية غير الصحيحة، يجوز لـ TEMPORARY™ الاستناد إلى القواعد القانونية المتعلقة بالتلف الناتج عن المستهلك."
   },
   {
    "number": "21",
    "titleEn": "Inspection of Returned Products",
    "titleAr": "فحص المنتجات المرتجعة",
    "bodyEn": "Returned products may be inspected before TEMPORARY™ completes its internal return procedures.\n\nThe inspection may include:\n\n- Product identity\n- Match with the order\n- Size\n- Colour\n- Design\n- Condition\n- Tags or labels\n- Signs of use\n- Signs of washing\n- Signs of alteration\n- Signs of damage\n- Product conformity\n\nTEMPORARY™ may document the result of the inspection.",
    "bodyAr": "يجوز فحص المنتجات المرتجعة قبل استكمال TEMPORARY™ لإجراءات الاسترجاع الداخلية.\n\nوقد يشمل الفحص:\n\n- هوية المنتج\n- مطابقة الطلب\n- المقاس\n- اللون\n- التصميم\n- الحالة\n- البطاقات أو الملصقات\n- علامات الاستخدام\n- علامات الغسيل\n- علامات التعديل\n- علامات التلف\n- مطابقة المنتج\n\nويجوز لـ TEMPORARY™ توثيق نتيجة الفحص."
   },
   {
    "number": "22",
    "titleEn": "No Automatic Right to Choose Any Replacement",
    "titleAr": "لا يوجد حق تلقائي في اختيار أي بديل",
    "bodyEn": "The customer does not automatically have the right to choose any replacement product they want.\n\nWhere the law gives the customer a right of return or exchange, TEMPORARY™ will provide the remedy required by law.\n\nWhere TEMPORARY™ offers an optional exchange beyond the legal obligation, the replacement product, size, colour and design are subject to availability.",
    "bodyAr": "لا يحق للعميل تلقائيًا اختيار أي منتج بديل يريده.\n\nعندما يمنح القانون العميل حقًا في الاسترجاع أو الاستبدال، تقدم TEMPORARY™ المعالجة التي يوجبها القانون.\n\nوعندما تقدم TEMPORARY™ استبدالًا اختياريًا يتجاوز الالتزام القانوني، فإن المنتج والمقاس واللون والتصميم البديل تخضع للتوافر."
   },
   {
    "number": "23",
    "titleEn": "Return Shipping Costs",
    "titleAr": "تكاليف شحن الاسترجاع",
    "bodyEn": "For returns or exchanges required by law, TEMPORARY™ complies with the applicable legal requirements regarding return costs.\n\nFor a defective or non-conforming product for which TEMPORARY™ is proven responsible, the customer will not bear any additional costs that the law requires TEMPORARY™ to bear.\n\nFor any optional or exceptional service that TEMPORARY™ provides outside the legal obligation, collection or delivery costs may be set according to terms communicated to the customer and in accordance with the law.",
    "bodyAr": "بالنسبة للاسترجاع أو الاستبدال الذي يفرضه القانون، تلتزم TEMPORARY™ بالمتطلبات القانونية المعمول بها بشأن تكاليف الإرجاع.\n\nوبالنسبة للمنتج المعيب أو غير المطابق الذي تثبت مسؤولية TEMPORARY™ عنه، لن يتحمل العميل أي تكاليف إضافية يتطلب القانون أن تتحملها TEMPORARY™.\n\nوبالنسبة لأي خدمة اختيارية أو استثنائية تقدمها TEMPORARY™ خارج الالتزام القانوني، يجوز تحديد تكاليف الاستلام أو التوصيل وفقًا للشروط التي يتم إبلاغ العميل بها وبما يتوافق مع القانون."
   },
   {
    "number": "24",
    "titleEn": "Unauthorised Returns",
    "titleAr": "المرتجعات غير المصرح بها",
    "bodyEn": "The customer must not independently send products to TEMPORARY™, the factory, the warehouse, employees or any other party without receiving proper return instructions.\n\nUnauthorised shipments may cause:\n\n- Problems identifying the order\n- Delivery problems\n- Tracking problems\n- Delays\n- Risk of product loss\n\nTEMPORARY™ may request sufficient information to identify an unauthorised shipment.\n\nThis administrative procedure does not cancel any legal right that applies to the customer.",
    "bodyAr": "يجب على العميل عدم إرسال المنتجات بشكل مستقل إلى TEMPORARY™ أو المصنع أو المخزن أو الموظفين أو أي جهة أخرى دون الحصول على تعليمات الإرجاع المناسبة.\n\nوقد تؤدي الشحنات غير المصرح بها إلى:\n\n- مشكلات في تحديد الطلب\n- مشكلات في التسليم\n- مشكلات في التتبع\n- تأخيرات\n- مخاطر فقدان المنتج\n\nويجوز لـ TEMPORARY™ طلب معلومات كافية لتحديد الشحنة غير المصرح بها.\n\nولا يلغي هذا الإجراء الإداري أي حق قانوني ينطبق على العميل."
   },
   {
    "number": "25",
    "titleEn": "Refunds",
    "titleAr": "المبالغ المستردة",
    "bodyEn": "Where a refund is legally required or has been approved, TEMPORARY™ will process the refund in accordance with the legal requirements and the relevant payment requirements.\n\nWhere the law requires a refund through the original payment method, TEMPORARY™ will use that same payment method.\n\nThe time it takes for the amount to appear in the customer's account after the refund is initiated may depend on the relevant bank, payment provider or financial institution.\n\nTEMPORARY™ does not control the timelines imposed by financial institutions or third-party payment providers after a refund has been initiated.",
    "bodyAr": "عندما يكون رد المبلغ واجبًا قانونًا أو تمت الموافقة عليه، ستقوم TEMPORARY™ بمعالجة رد المبلغ وفقًا للمتطلبات القانونية ومتطلبات الدفع ذات الصلة.\n\nوعندما يتطلب القانون رد المبلغ من خلال وسيلة الدفع الأصلية، ستستخدم TEMPORARY™ وسيلة الدفع ذاتها.\n\nوقد تعتمد المدة التي يستغرقها ظهور المبلغ في حساب العميل بعد بدء عملية الاسترداد على البنك أو مزود الدفع أو المؤسسة المالية ذات الصلة.\n\nولا تتحكم TEMPORARY™ في المدد التي تفرضها المؤسسات المالية أو مزودو الدفع من طرف ثالث بعد بدء عملية الاسترداد."
   },
   {
    "number": "26",
    "titleEn": "Refund Details",
    "titleAr": "بيانات الاسترداد",
    "bodyEn": "Approved refunds for online payments are returned through the original payment method via Paymob.\n\nTEMPORARY™ may request the reasonable information needed to process the refund securely. Any refund will be handled in accordance with the law and the available refund procedures.",
    "bodyAr": "المبالغ اللي بيتوافق على استردادها للمدفوعات الأونلاين بترجع بنفس طريقة الدفع من خلال Paymob.\n\nومن حق TEMPORARY™ تطلب المعلومات المعقولة اللازمة لمعالجة الاسترداد بأمان. وأي استرداد بيتم وفقًا للقانون وإجراءات الاسترداد المتاحة."
   },
   {
    "number": "27",
    "titleEn": "Electronic Payment",
    "titleAr": "الدفع الإلكتروني",
    "bodyEn": "For electronic payments, TEMPORARY™ will process approved refunds through the applicable payment method and payment provider.\n\nPayment provider processing times are outside the direct control of TEMPORARY™.",
    "bodyAr": "بالنسبة للمدفوعات الإلكترونية، ستقوم TEMPORARY™ بمعالجة المبالغ المستردة المعتمدة من خلال وسيلة الدفع ومزود الدفع المعمول بهما.\n\nوتقع مدد معالجة مزود الدفع خارج نطاق السيطرة المباشرة لـ TEMPORARY™."
   },
   {
    "number": "28",
    "titleEn": "Transaction Processing Fees",
    "titleAr": "رسوم معالجة المعاملات",
    "bodyEn": "Where the customer exercises a legal right of return, or in the case of a defective product, TEMPORARY™ complies with the legal requirements regarding the amount to be refunded and any costs that may or may not be charged to the customer.\n\nTEMPORARY™ does not deduct any amount that the law requires to be refunded to the customer.",
    "bodyAr": "عندما يمارس العميل حقًا قانونيًا في الاسترجاع أو في حالة وجود منتج معيب، تلتزم TEMPORARY™ بالمتطلبات القانونية المتعلقة بالمبلغ الواجب رده وأي تكاليف يجوز أو لا يجوز تحميلها للعميل.\n\nولا تخصم TEMPORARY™ أي مبلغ يوجب القانون رده إلى العميل."
   },
   {
    "number": "29",
    "titleEn": "Products Made to Special Specifications",
    "titleAr": "المنتجات ذات المواصفات الخاصة",
    "bodyEn": "Where TEMPORARY™ provides products made to special specifications specifically requested by the customer, TEMPORARY™ may rely on the applicable legal exception where:\n\n1. The customer specifically requested the special specification; and\n2. The delivered product conforms to that specification.\n\nThis exception does not apply simply because the customer chose a regular product from the TEMPORARY™ catalogue.",
    "bodyAr": "عندما تقدم TEMPORARY™ منتجات مصنعة وفق مواصفات خاصة طلبها العميل تحديدًا، يجوز لـ TEMPORARY™ الاستناد إلى الاستثناء القانوني المعمول به عندما:\n\n1. يكون العميل قد طلب المواصفة الخاصة تحديدًا؛ و\n2. يكون المنتج المسلم مطابقًا لهذه المواصفة.\n\nولا يطبق هذا الاستثناء لمجرد أن العميل اختار منتجًا عاديًا من كتالوج TEMPORARY™."
   },
   {
    "number": "30",
    "titleEn": "Customised Products",
    "titleAr": "المنتجات المخصصة",
    "bodyEn": "If TEMPORARY™ offers customised products in the future that require special production for each customer, the return treatment may differ from regular catalogue products.\n\nThe customer will be informed of any applicable terms before confirming the customised order.\n\nThis section does not affect mandatory legal rights relating to defective or non-conforming products.",
    "bodyAr": "إذا قدمت TEMPORARY™ مستقبلًا منتجات مخصصة تتطلب إنتاجًا خاصًا لكل عميل، فقد تختلف معاملة الاسترجاع عن المنتجات العادية الموجودة في الكتالوج.\n\nوسيتم إبلاغ العميل بأي شروط تنطبق قبل تأكيد الطلب المخصص.\n\nولا يؤثر هذا البند على الحقوق القانونية الإلزامية المتعلقة بالمنتجات المعيبة أو غير المطابقة."
   },
   {
    "number": "31",
    "titleEn": "Fraudulent or Abusive Requests",
    "titleAr": "الطلبات الاحتيالية أو المسيئة",
    "bodyEn": "TEMPORARY™ may examine requests that appear fraudulent, misleading or abusive of the returns system.\n\nThis includes, for example:\n\n- Claiming a product is defective when the evidence indicates damage caused by the customer\n- Returning a different product\n- Returning a product that was not purchased from TEMPORARY™\n- Intentionally damaging the product\n- Altering the product before claiming a manufacturing defect\n- Submitting repeated requests for the same transaction\n- Providing materially false information\n\nTEMPORARY™ may take the actions permitted by law.\n\nA genuine legal claim will not be rejected simply because the customer has previously made a legitimate claim.",
    "bodyAr": "يجوز لـ TEMPORARY™ فحص الطلبات التي تبدو احتيالية أو مضللة أو مسيئة لنظام الاسترجاع.\n\nويشمل ذلك، على سبيل المثال:\n\n- الادعاء بأن المنتج معيب بينما تشير الأدلة إلى تلف تسبب فيه العميل\n- إعادة منتج مختلف\n- إعادة منتج لم يتم شراؤه من TEMPORARY™\n- إتلاف المنتج عمدًا\n- تعديل المنتج قبل الادعاء بوجود عيب في التصنيع\n- تقديم طلبات متكررة لنفس المعاملة\n- تقديم معلومات كاذبة بشكل جوهري\n\nويجوز لـ TEMPORARY™ اتخاذ الإجراءات التي يسمح بها القانون.\n\nولا يتم رفض مطالبة قانونية حقيقية لمجرد أن العميل سبق له تقديم مطالبة مشروعة."
   },
   {
    "number": "32",
    "titleEn": "Multiple Orders / Claims",
    "titleAr": "تعدد الطلبات / المطالبات",
    "bodyEn": "Each return, exchange request or defect complaint may be assessed on the basis of its related order.\n\nTEMPORARY™ may request the order number and documents relating to each claim.\n\nWhere a claim involves several products, TEMPORARY™ may ask the customer to specify the product concerned.",
    "bodyAr": "يجوز تقييم كل طلب استرجاع أو استبدال أو شكوى عيب على أساس الطلب المرتبط به.\n\nويجوز لـ TEMPORARY™ طلب رقم الطلب والمستندات المتعلقة بكل مطالبة.\n\nوعندما تتضمن المطالبة عدة منتجات، يجوز لـ TEMPORARY™ طلب تحديد المنتج المعني تحديدًا."
   },
   {
    "number": "33",
    "titleEn": "Shipment Damage During Delivery",
    "titleAr": "تلف الشحنة أثناء التوصيل",
    "bodyEn": "Customers are advised to inspect the shipment on receipt.\n\nWhere reasonably possible, customers are advised to photograph any visible damage to the outer packaging before opening it.\n\nIf the product itself is damaged, the customer should provide photos or a video showing the problem.\n\nTEMPORARY™ may review the available delivery and fulfilment information as part of the inspection process.",
    "bodyAr": "ينصح العملاء بفحص الشحنة عند استلامها.\n\nوعندما يكون ذلك ممكنًا بشكل معقول، يُنصح بتصوير أي تلف ظاهر في العبوة الخارجية قبل فتحها.\n\nإذا كان المنتج نفسه تالفًا، ينبغي على العميل تقديم صور أو فيديو يوضح المشكلة.\n\nويجوز لـ TEMPORARY™ مراجعة بيانات التوصيل والتنفيذ المتاحة كجزء من عملية الفحص."
   },
   {
    "number": "34",
    "titleEn": "Communication with the Customer",
    "titleAr": "التواصل مع العميل",
    "bodyEn": "All return requests and defect complaints must be submitted through the official TEMPORARY™ customer support channel.\n\nThe customer should keep:\n\n- The order number\n- The order confirmation details\n- The delivery details\n- Relevant photos\n- Relevant videos\n- Correspondence with TEMPORARY™\n\nTEMPORARY™ may use order records and correspondence when assessing the request.",
    "bodyAr": "يجب تقديم جميع طلبات الاسترجاع وشكاوى العيوب من خلال قناة دعم العملاء الرسمية الخاصة بـ TEMPORARY™.\n\nوينبغي على العميل الاحتفاظ بـ:\n\n- رقم الطلب\n- بيانات تأكيد الطلب\n- بيانات التوصيل\n- الصور ذات الصلة\n- مقاطع الفيديو ذات الصلة\n- المراسلات مع TEMPORARY™\n\nويجوز لـ TEMPORARY™ استخدام سجلات الطلبات والمراسلات عند تقييم الطلب."
   },
   {
    "number": "35",
    "titleEn": "Deadlines and Documents",
    "titleAr": "المواعيد النهائية والمستندات",
    "bodyEn": "The applicable legal period is determined by the date the product was received.\n\nThe customer should submit the request as soon as possible after discovering the problem.\n\nTEMPORARY™ may request the documents and information needed to identify and assess the request.\n\nThe legal period is not extended or shortened simply because the customer is late in providing information, unless the law provides otherwise.",
    "bodyAr": "يتم تحديد المدة القانونية المطبقة وفقًا لتاريخ استلام المنتج.\n\nوينبغي على العميل تقديم طلبه في أقرب وقت ممكن بعد اكتشاف المشكلة.\n\nويجوز لـ TEMPORARY™ طلب المستندات والمعلومات اللازمة لتحديد الطلب وتقييمه.\n\nولا يتم تمديد أو تقليل المدة القانونية لمجرد تأخر العميل في تقديم المعلومات، ما لم ينص القانون على خلاف ذلك."
   },
   {
    "number": "36",
    "titleEn": "What TEMPORARY™ Is Not Obliged to Provide",
    "titleAr": "ما لا تلتزم TEMPORARY™ بتقديمه",
    "bodyEn": "TEMPORARY™ is not obliged to provide:\n\n- Unlimited exchanges\n- A guaranteed replacement for an unavailable limited-edition product\n- An immediate refund before the applicable procedures are completed\n- Automatic approval of every defect claim\n- Replacement of the product with any product the customer chooses\n- Reproduction of discontinued products\n- A refund through a payment method unrelated to the purchase where the law requires the original payment method\n\nTEMPORARY™ will provide the remedy required by law when the necessary legal conditions are met.",
    "bodyAr": "لا تلتزم TEMPORARY™ بتقديم:\n\n- استبدالات غير محدودة\n- ضمان استبدال منتج محدود الإصدار غير متوفر\n- رد فوري للمبلغ قبل استكمال الإجراءات المنطبقة\n- الموافقة التلقائية على كل ادعاء بوجود عيب\n- استبدال المنتج بأي منتج يختاره العميل\n- إعادة إنتاج المنتجات التي تم إيقافها\n- رد الأموال من خلال وسيلة دفع غير مرتبطة بالشراء عندما يتطلب القانون استخدام وسيلة الدفع الأصلية\n\nوستقدم TEMPORARY™ المعالجة التي يوجبها القانون عندما تتحقق الشروط القانونية اللازمة."
   },
   {
    "number": "37",
    "titleEn": "Disputes About Defects",
    "titleAr": "النزاعات المتعلقة بالعيوب",
    "bodyEn": "Where TEMPORARY™ and the customer disagree about whether a product is defective, the matter may be handled through the applicable consumer protection procedures.\n\nIn accordance with the applicable procedures, the customer may file a complaint with the Consumer Protection Agency if there is a dispute about a defect, and the Agency may examine the dispute and decide on it in accordance with the law.\n\nTEMPORARY™ reserves the right to submit its records, inspection results and supporting documents in any such dispute.",
    "bodyAr": "عندما تختلف TEMPORARY™ والعميل حول وجود عيب في المنتج، يجوز التعامل مع الأمر من خلال إجراءات حماية المستهلك المعمول بها.\n\nويجوز للعميل، وفقًا للإجراءات المطبقة، تقديم شكوى إلى جهاز حماية المستهلك في حال وجود نزاع حول وجود عيب، ويجوز للجهاز فحص النزاع واتخاذ القرار وفقًا للقانون.\n\nوتحتفظ TEMPORARY™ بحقها في تقديم سجلاتها ونتائج الفحص والمستندات المؤيدة في أي نزاع من هذا النوع."
   },
   {
    "number": "38",
    "titleEn": "Invoices and Purchase Records",
    "titleAr": "الفواتير وسجلات الشراء",
    "bodyEn": "TEMPORARY™ will provide transaction documents to the extent required by law.\n\nThe customer should keep the order confirmation and invoice.",
    "bodyAr": "ستوفر TEMPORARY™ المستندات المتعلقة بالمعاملة بالقدر الذي يقتضيه القانون.\n\nوينبغي على العميل الاحتفاظ بتأكيد الطلب والفاتورة."
   },
   {
    "number": "39",
    "titleEn": "Interpretation of This Policy",
    "titleAr": "تفسير السياسة",
    "bodyEn": "This policy is intended to set out TEMPORARY™'s operational procedures for returns and exchanges while preserving mandatory consumer rights.\n\nIf any provision of this policy conflicts with a mandatory provision of applicable Egyptian law, the mandatory legal provision prevails.\n\nThe remaining provisions of the policy remain in force to the extent permitted by law.",
    "bodyAr": "تهدف هذه السياسة إلى تحديد إجراءات TEMPORARY™ التشغيلية المتعلقة بالاسترجاع والاستبدال مع الحفاظ على حقوق المستهلك الإلزامية.\n\nإذا تعارض أي بند من هذه السياسة مع نص إلزامي من القانون المصري واجب التطبيق، يسود النص القانوني الإلزامي.\n\nوتظل بقية أحكام السياسة سارية بالقدر الذي يسمح به القانون."
   },
   {
    "number": "40",
    "titleEn": "Policy Updates",
    "titleAr": "تحديث السياسة",
    "bodyEn": "TEMPORARY™ may update this policy when products, operations or applicable legal requirements change.\n\nThe version that applies to an order is determined in accordance with the law and the terms communicated to the customer at the time of purchase.",
    "bodyAr": "يجوز لـ TEMPORARY™ تحديث هذه السياسة عندما تتغير المنتجات أو العمليات أو المتطلبات القانونية المعمول بها.\n\nويتم تحديد النسخة المنطبقة على الطلب وفقًا للقانون والشروط التي تم إبلاغ العميل بها وقت الشراء."
   },
   {
    "number": "41",
    "titleEn": "Contact",
    "titleAr": "التواصل",
    "bodyEn": "All return requests, exchange requests and product quality complaints must be submitted through the official TEMPORARY™ customer support channel.\n\nPlease include the **order number** in every request or claim.",
    "bodyAr": "يجب تقديم جميع طلبات الاسترجاع والاستبدال وشكاوى جودة المنتجات من خلال قناة دعم العملاء الرسمية الخاصة بـ TEMPORARY™.\n\nيرجى تضمين **رقم الطلب** في كل طلب أو مطالبة."
   }
  ]
 },
 {
  "policyId": "shipping",
  "slug": "shipping",
  "order": 2,
  "titleEn": "Shipping & Delivery Policy",
  "titleAr": "سياسة الشحن والتوصيل",
  "subtitleEn": "Delivery areas, fees, payment and receiving",
  "subtitleAr": "مناطق التوصيل والمصاريف والدفع والاستلام",
  "effectiveEn": "October 2026",
  "effectiveAr": "أكتوبر 2026",
  "introEn": "This policy explains how TEMPORARY™ prepares, ships and delivers orders placed through its official website.\n\nTEMPORARY™ pieces are produced and prepared in limited quantities, so every order follows a defined process from confirmation to delivery.\n\nThis policy is applied in accordance with applicable Egyptian law and should be read together with the TEMPORARY™ Terms & Conditions and the Returns, Exchanges & Product Defects Policy.",
  "introAr": "السياسة دي بتوضح إزاي TEMPORARY™ بتجهّز وتشحن وتوصّل الطلبات اللي بتتعمل من خلال الموقع الرسمي.\n\nقطع TEMPORARY™ بتتعمل وتتجهز بكميات محدودة، عشان كده كل طلب بيمشي في خطوات واضحة من التأكيد لحد التوصيل.\n\nالسياسة دي بتتطبق بما يتوافق مع القوانين المصرية السارية، وبتتقري مع الشروط والأحكام وسياسة الاسترجاع والاستبدال وعيوب المنتجات الخاصة بـ TEMPORARY™.",
  "closingEn": "**Prepared with care.**\n**Delivered with intent.**\n**EVERYTHING IS TEMPORARY.**",
  "closingAr": "**بتتجهز باهتمام.**\n**وبتوصل بقصد.**\n**EVERYTHING IS TEMPORARY.**",
  "sections": [
   {
    "number": "01",
    "titleEn": "Where We Deliver",
    "titleAr": "بنوصّل فين",
    "bodyEn": "TEMPORARY™ delivers within the Arab Republic of Egypt to the governorates and areas listed at checkout.\n\nIf your area does not appear at checkout, we do not deliver there yet. You can contact us to ask whether delivery to your area will be added.",
    "bodyAr": "TEMPORARY™ بتوصّل جوه جمهورية مصر العربية للمحافظات والمناطق اللي بتظهر في صفحة إتمام الطلب.\n\nلو منطقتك مش ظاهرة في صفحة إتمام الطلب، يبقى لسه مش بنوصّل لها. تقدر تتواصل معانا وتسأل إذا كان التوصيل لمنطقتك هيتضاف."
   },
   {
    "number": "02",
    "titleEn": "Payment and Order Confirmation",
    "titleAr": "الدفع وتأكيد الطلب",
    "bodyEn": "Orders are paid online at checkout through our secure payment partner, Paymob, by card or mobile wallet.\n\nYour order is confirmed automatically as soon as the payment succeeds, and you receive an order-received email with your order details.\n\n**If the payment is not completed within the payment window shown at checkout, the order is cancelled automatically and the reserved pieces are released.**\n\nPreparation and delivery begin only after the payment is confirmed.",
    "bodyAr": "الطلبات بتتدفع أونلاين وقت إتمام الطلب من خلال شريك الدفع الآمن بتاعنا Paymob، بالكارت أو بالمحفظة.\n\nطلبك بيتأكد تلقائيًا أول ما الدفع ينجح، وبيوصلك إيميل باستلام الطلب فيه كل التفاصيل.\n\n**لو الدفع ما اكتملش خلال فترة الدفع اللي بتظهر لك وقت إتمام الطلب، الطلب بيتلغي تلقائيًا والقطع اللي كانت محجوزة له بترجع متاحة.**\n\nالتجهيز والتوصيل بيبدأوا بعد تأكيد الدفع بس."
   },
   {
    "number": "03",
    "titleEn": "Preparation Time",
    "titleAr": "مدة التجهيز",
    "bodyEn": "Once your order is confirmed, it moves through preparation, quality control and packaging.\n\nBecause pieces are printed and prepared for each order, preparation time may vary depending on the drop, the design and the order volume.\n\nYou can follow your order status at any time from your account on the website.",
    "bodyAr": "أول ما طلبك يتأكد، بيدخل مرحلة التجهيز ومراجعة الجودة والتغليف.\n\nولأن القطع بتتطبع وتتجهز لكل طلب، مدة التجهيز ممكن تختلف حسب الدروب والتصميم وعدد الطلبات.\n\nتقدر تتابع حالة طلبك في أي وقت من حسابك على الموقع."
   },
   {
    "number": "04",
    "titleEn": "Delivery Fees",
    "titleAr": "مصاريف التوصيل",
    "bodyEn": "The delivery fee depends on your governorate and area.\n\nThe exact delivery fee is calculated by the TEMPORARY™ system and shown at checkout before you place the order.\n\nThe total you pay is the total shown on your order summary, including the delivery fee.",
    "bodyAr": "مصاريف التوصيل بتختلف حسب المحافظة والمنطقة.\n\nمصاريف التوصيل بالظبط بيحسبها نظام TEMPORARY™ وبتظهر لك في صفحة إتمام الطلب قبل ما تأكّد.\n\nالمبلغ اللي هتدفعه هو الإجمالي اللي ظاهر في ملخص طلبك، شامل مصاريف التوصيل."
   },
   {
    "number": "05",
    "titleEn": "Estimated Delivery Time",
    "titleAr": "مدة التوصيل المتوقعة",
    "bodyEn": "Every piece is made for you after you order. Orders are delivered **within 8 working days** from the date the payment is confirmed.\n\nFriday and Saturday are days off and are not counted as working days.\n\nDelivery times may be affected by public holidays, weather, high-demand periods, the courier's operations or circumstances outside our control.\n\nIf there is a significant delay, we will do our best to inform you.",
    "bodyAr": "كل قطعة بتتعمل مخصوص ليك بعد ما تطلب. الطلبات بتتوصل **خلال ٨ أيام عمل** من تاريخ تأكيد الدفع.\n\nالجمعة والسبت إجازة ومش بيتحسبوا من أيام العمل.\n\nمدة التوصيل ممكن تتأثر بالإجازات الرسمية أو الطقس أو مواسم الضغط أو شغل شركة الشحن أو ظروف خارجة عن إرادتنا.\n\nلو حصل تأخير كبير، هنحاول نبلغك على قد ما نقدر."
   },
   {
    "number": "06",
    "titleEn": "Payment",
    "titleAr": "الدفع",
    "bodyEn": "Orders are paid online in full at checkout by card (Visa, Mastercard, Meeza) or mobile wallet, through Paymob.\n\nYou do not pay the courier anything on delivery. The courier is not authorised to collect money, change prices or apply discounts.\n\nTEMPORARY™ does not see or store your card details. Payments are processed securely by Paymob.",
    "bodyAr": "الطلبات بتتدفع أونلاين بالكامل وقت إتمام الطلب بالكارت (Visa أو Mastercard أو ميزة) أو بالمحفظة، من خلال Paymob.\n\nمش هتدفع أي حاجة للمندوب وقت الاستلام، والمندوب مش مسموح له ياخد فلوس أو يغيّر الأسعار أو يعمل خصم.\n\nTEMPORARY™ مش بتشوف ولا بتحفظ بيانات الكارت بتاعك. الدفع بيتم بأمان من خلال Paymob."
   },
   {
    "number": "07",
    "titleEn": "Order Status",
    "titleAr": "حالة الطلب",
    "bodyEn": "You can follow your order through the following stages:\n\n- Awaiting payment\n- Confirmed\n- Processing\n- Ready for delivery\n- Out for delivery\n- Delivered\n\nAn order may also show as Cancelled if the payment was not completed in time, or if it was cancelled in accordance with our policies.",
    "bodyAr": "تقدر تتابع طلبك في المراحل دي:\n\n- مستني الدفع\n- اتأكد\n- جاري التجهيز\n- جاهز للتوصيل\n- في الطريق\n- اتسلّم\n\nوممكن الطلب يظهر \"ملغي\" لو الدفع ما اكتملش في الوقت المحدد، أو لو اتلغى حسب سياساتنا."
   },
   {
    "number": "08",
    "titleEn": "Your Delivery Details",
    "titleAr": "بيانات التوصيل بتاعتك",
    "bodyEn": "You are responsible for entering a correct name, phone number and full delivery address.\n\nPlease keep your phone available. The courier may call you to arrange the delivery.\n\nIf you need to change your delivery details, contact us as soon as possible. Changes may not be possible once the order is out for delivery.",
    "bodyAr": "أنت مسؤول إنك تكتب الاسم ورقم الموبايل والعنوان بالتفصيل بشكل صحيح.\n\nياريت تخلي موبايلك متاح، لأن المندوب ممكن يكلمك عشان يرتب معاك التوصيل.\n\nلو محتاج تغيّر بيانات التوصيل، كلمنا في أسرع وقت. التغيير ممكن ميبقاش متاح بعد ما الطلب يخرج للتوصيل."
   },
   {
    "number": "09",
    "titleEn": "Failed Delivery Attempts",
    "titleAr": "محاولات التوصيل اللي ما نجحتش",
    "bodyEn": "If the courier cannot reach you or cannot deliver the order to the address provided, another attempt may be arranged.\n\nIf delivery fails repeatedly because the customer is unavailable, unreachable or refuses to receive the order without a valid reason, TEMPORARY™ may cancel the order. Any refund in that case is handled according to the Returns, Exchanges & Product Defects Policy and the law.",
    "bodyAr": "لو المندوب ما قدرش يوصل لك أو ما قدرش يسلّم الطلب على العنوان المكتوب، ممكن نرتب محاولة تانية.\n\nلو التوصيل فشل أكتر من مرة لأن العميل مش متاح أو مش بيرد أو رفض يستلم من غير سبب مقبول، من حق TEMPORARY™ تلغي الطلب. وأي استرداد في الحالة دي بيتم حسب سياسة الاسترجاع والاستبدال وعيوب المنتجات والقانون."
   },
   {
    "number": "10",
    "titleEn": "Receiving Your Order",
    "titleAr": "استلام طلبك",
    "bodyEn": "Please inspect the outer packaging when you receive the order.\n\nWhere reasonably possible, photograph any visible damage to the packaging before opening it.\n\nIf the product itself is damaged, wrong or does not match your confirmed order, contact us and follow the steps in the Returns, Exchanges & Product Defects Policy.",
    "bodyAr": "ياريت تبص على التغليف الخارجي وأنت بتستلم الطلب.\n\nولو أمكن، صوّر أي تلف باين في التغليف قبل ما تفتحه.\n\nلو المنتج نفسه فيه تلف، أو مش هو، أو مش مطابق للطلب اللي أكدته، كلمنا واتبع الخطوات اللي في سياسة الاسترجاع والاستبدال وعيوب المنتجات."
   },
   {
    "number": "11",
    "titleEn": "Returns and Exchanges",
    "titleAr": "الاسترجاع والاستبدال",
    "bodyEn": "Returns, exchanges and defect complaints are handled according to the TEMPORARY™ Returns, Exchanges & Product Defects Policy.\n\nPlease do not send any product back to us without first receiving return instructions from TEMPORARY™.",
    "bodyAr": "الاسترجاع والاستبدال وشكاوى العيوب بيتم التعامل معاهم حسب سياسة الاسترجاع والاستبدال وعيوب المنتجات الخاصة بـ TEMPORARY™.\n\nياريت ما تبعتش أي منتج لنا قبل ما توصلك تعليمات الإرجاع من TEMPORARY™."
   },
   {
    "number": "12",
    "titleEn": "Policy Updates",
    "titleAr": "تحديث السياسة",
    "bodyEn": "TEMPORARY™ may update this policy when operations, delivery partners or legal requirements change.\n\nThe version that applies to an order is the version communicated to the customer at the time of purchase, in accordance with the law.",
    "bodyAr": "من حق TEMPORARY™ تحدّث السياسة دي لما طريقة الشغل أو شركات الشحن أو المتطلبات القانونية تتغير.\n\nالنسخة اللي بتنطبق على أي طلب هي النسخة اللي اتبلّغت للعميل وقت الشراء، حسب القانون."
   },
   {
    "number": "13",
    "titleEn": "Contact",
    "titleAr": "التواصل",
    "bodyEn": "For any question about shipping or delivery, contact us through the Contact page on the website.\n\nPlease include your **order number** in every message.",
    "bodyAr": "لأي سؤال عن الشحن أو التوصيل، تواصل معانا من صفحة \"تواصل معانا\" على الموقع.\n\nياريت تكتب **رقم الطلب** في كل رسالة."
   }
  ]
 },
 {
  "policyId": "privacy",
  "slug": "privacy",
  "order": 3,
  "titleEn": "Privacy Policy",
  "titleAr": "سياسة الخصوصية",
  "subtitleEn": "What we collect and how we protect it",
  "subtitleAr": "بنجمع إيه وبنحميه إزاي",
  "effectiveEn": "October 2026",
  "effectiveAr": "أكتوبر 2026",
  "introEn": "This policy explains what personal information TEMPORARY™ collects when you use the official website, why we collect it, how we use it and the choices you have.\n\nWe collect only the information we need to run the store, deliver your orders and support you.\n\nThis policy is applied in accordance with applicable Egyptian law, including the rules on the protection of personal data.",
  "introAr": "السياسة دي بتوضح المعلومات الشخصية اللي TEMPORARY™ بتجمعها لما تستخدم الموقع الرسمي، وليه بنجمعها، وبنستخدمها إزاي، والاختيارات اللي في إيدك.\n\nإحنا بنجمع بس المعلومات اللي محتاجينها عشان نشغّل المتجر ونوصّل طلباتك ونساعدك.\n\nالسياسة دي بتتطبق بما يتوافق مع القوانين المصرية السارية، ومنها قواعد حماية البيانات الشخصية.",
  "closingEn": "**Your data, kept to what matters.**\n**EVERYTHING IS TEMPORARY.**",
  "closingAr": "**بياناتك، على قد اللي يهم.**\n**EVERYTHING IS TEMPORARY.**",
  "sections": [
   {
    "number": "01",
    "titleEn": "Who We Are",
    "titleAr": "إحنا مين",
    "bodyEn": "TEMPORARY™ is a limited-edition clothing brand based in Cairo, Egypt.\n\nIn this policy, \"TEMPORARY™\", \"we\" and \"us\" mean the TEMPORARY™ brand and the team that operates its official website.",
    "bodyAr": "TEMPORARY™ براند ملابس بإصدارات محدودة، مقرها القاهرة، مصر.\n\nفي السياسة دي، كلمة \"TEMPORARY™\" أو \"إحنا\" معناها براند TEMPORARY™ والفريق اللي بيشغّل الموقع الرسمي."
   },
   {
    "number": "02",
    "titleEn": "Information You Give Us",
    "titleAr": "المعلومات اللي بتديهالنا",
    "bodyEn": "When you use the website, you may give us:\n\n- Your name and email address, at checkout or through Google sign-in\n- Your phone number\n- Your date of birth, if you choose to join the founders list\n- Your governorate, area and full delivery address\n- The products, designs, colours, sizes and quantities you choose\n- Messages you send us through the contact form or by email\n\nCard and wallet details are entered on Paymob's secure page. TEMPORARY™ never receives or stores them.",
    "bodyAr": "وأنت بتستخدم الموقع، ممكن تدينا:\n\n- اسمك وإيميلك، وقت إتمام الطلب أو من خلال تسجيل الدخول بـ Google\n- رقم موبايلك\n- تاريخ ميلادك، لو حبيت تنضم لقائمة الـ Founders\n- المحافظة والمنطقة والعنوان بالتفصيل\n- المنتجات والتصميمات والألوان والمقاسات والكميات اللي بتختارها\n- الرسايل اللي بتبعتها لنا من فورم التواصل أو على الإيميل\n\nبيانات الكارت والمحفظة بتتكتب في صفحة Paymob الآمنة، وTEMPORARY™ عمرها ما بتستلمها ولا بتحفظها."
   },
   {
    "number": "03",
    "titleEn": "Information Collected Automatically",
    "titleAr": "المعلومات اللي بتتسجل تلقائيًا",
    "bodyEn": "When you use the website, we may record:\n\n- A secure session that keeps you signed in on your device\n- The contents of your bag, so it stays the same on all your devices\n- Basic activity such as page views, product views, items added to the bag and completed checkouts\n- The general type of device you use (phone, tablet or desktop)\n\nWe do not collect your Google password. Google sign-in only shares your verified name, email address and account identifier with us.",
    "bodyAr": "وأنت بتستخدم الموقع، ممكن نسجّل:\n\n- جلسة دخول آمنة بتخليك مسجّل دخول على جهازك\n- محتوى سلتك، عشان تفضل هي هي على كل أجهزتك\n- نشاط بسيط زي الصفحات اللي فتحتها، والمنتجات اللي شفتها، والقطع اللي ضفتها للسلة، والطلبات اللي اكتملت\n- نوع الجهاز بشكل عام (موبايل، تابلت، أو كمبيوتر)\n\nإحنا مش بناخد باسورد Google بتاعك. تسجيل الدخول بـ Google بيدينا بس اسمك وإيميلك المتأكد منهم ومعرّف الحساب."
   },
   {
    "number": "04",
    "titleEn": "Information Stored in Your Browser",
    "titleAr": "المعلومات اللي بتتحفظ في المتصفح",
    "bodyEn": "The website stores a small amount of information in your browser to work properly, such as:\n\n- Your session key, so you stay signed in\n- Your language choice\n- A copy of the catalogue, so pages load faster\n\nYou can clear this information at any time from your browser settings. You will then need to sign in again.",
    "bodyAr": "الموقع بيحفظ معلومات بسيطة في المتصفح بتاعك عشان يشتغل كويس، زي:\n\n- مفتاح الجلسة، عشان تفضل مسجّل دخول\n- اللغة اللي اخترتها\n- نسخة من الكتالوج، عشان الصفحات تفتح أسرع\n\nتقدر تمسح المعلومات دي في أي وقت من إعدادات المتصفح، وبعدها هتحتاج تسجّل دخول تاني."
   },
   {
    "number": "05",
    "titleEn": "How We Use Your Information",
    "titleAr": "بنستخدم معلوماتك في إيه",
    "bodyEn": "We use your information to:\n\n- Create and secure your account\n- Keep your bag the same across your devices\n- Process, prepare and deliver your orders\n- Send order emails and order updates\n- Send founders updates and a birthday surprise, only if you chose to join\n- Answer your questions and handle return, exchange and defect requests\n- Prevent fraud and abuse of the store\n- Understand how the store is used, so we can improve it and show relevant ads\n- Comply with our legal obligations",
    "bodyAr": "بنستخدم معلوماتك عشان:\n\n- نعمل حسابك ونأمّنه\n- نخلي سلتك زي ما هي على كل أجهزتك\n- نستلم طلباتك ونجهزها ونوصّلها\n- نبعت لك إيميلات الطلب والتحديثات\n- نبعت لك أخبار الـ Founders ومفاجأة عيد ميلادك، لو اخترت تنضم بس\n- نرد على أسئلتك ونتعامل مع طلبات الاسترجاع والاستبدال والعيوب\n- نمنع الاحتيال وسوء استخدام المتجر\n- نفهم المتجر بيتستخدم إزاي عشان نحسّنه ونعرض إعلانات مناسبة\n- نلتزم بالتزاماتنا القانونية"
   },
   {
    "number": "06",
    "titleEn": "Who We Share Your Information With",
    "titleAr": "بنشارك معلوماتك مع مين",
    "bodyEn": "We do not sell your personal information.\n\nWe share information only when it is needed to run the store, for example with:\n\n- Paymob, our payment partner, which processes your payment\n- Delivery partners, who receive your name, phone number and address\n- Production and fulfilment partners, who receive the order details needed to prepare your pieces\n- Service providers that host our systems, such as Google services used to run the website and store order records\n- Meta (Facebook / Instagram), which receives website activity such as page views and purchases to measure and improve our ads\n- Authorities, when the law requires it\n\nEach party receives only the information it needs for its role.",
    "bodyAr": "إحنا مش بنبيع معلوماتك الشخصية.\n\nبنشارك المعلومات بس لما تكون محتاجينها عشان نشغّل المتجر، مثلًا مع:\n\n- Paymob، شريك الدفع بتاعنا، وبيعالج عملية الدفع\n- شركات التوصيل، وبياخدوا اسمك ورقم موبايلك وعنوانك\n- شركاء الإنتاج والتجهيز، وبياخدوا تفاصيل الطلب اللي محتاجينها عشان يجهزوا قطعك\n- مقدمي الخدمات اللي بيستضيفوا أنظمتنا، زي خدمات Google اللي بنستخدمها لتشغيل الموقع وحفظ سجلات الطلبات\n- Meta (فيسبوك / انستجرام)، وبتاخد نشاطك على الموقع زي الصفحات اللي فتحتها والمشتريات عشان نقيس إعلاناتنا ونحسّنها\n- الجهات الرسمية، لما القانون يطلب كده\n\nكل جهة بتاخد بس المعلومات اللي محتاجاها لدورها."
   },
   {
    "number": "07",
    "titleEn": "Where Your Information Is Stored",
    "titleAr": "معلوماتك بتتحفظ فين",
    "bodyEn": "Your information is stored in secure cloud systems operated by our service providers, including Google services.\n\nAccess to order and customer records is limited to authorised TEMPORARY™ team members.",
    "bodyAr": "معلوماتك بتتحفظ في أنظمة سحابية آمنة بيشغلها مقدمي الخدمات بتوعنا، ومنها خدمات Google.\n\nالوصول لسجلات الطلبات والعملاء مقصور على أعضاء فريق TEMPORARY™ المصرّح لهم بس."
   },
   {
    "number": "08",
    "titleEn": "How Long We Keep Your Information",
    "titleAr": "بنحتفظ بمعلوماتك قد إيه",
    "bodyEn": "We keep your information for as long as your account is active and as long as needed to deliver orders, handle returns and complaints, and meet legal, accounting and tax requirements.\n\nExpired sign-in sessions are removed regularly.\n\nWhen information is no longer needed, we delete it or make it anonymous.",
    "bodyAr": "بنحتفظ بمعلوماتك طول ما حسابك شغال، وطول ما إحنا محتاجينها عشان نوصّل الطلبات ونتعامل مع الاسترجاع والشكاوى ونلتزم بالمتطلبات القانونية والمحاسبية والضريبية.\n\nجلسات الدخول المنتهية بتتمسح بشكل دوري.\n\nولما المعلومات متبقاش مطلوبة، بنمسحها أو بنخليها مجهولة الهوية."
   },
   {
    "number": "09",
    "titleEn": "Your Rights",
    "titleAr": "حقوقك",
    "bodyEn": "Subject to applicable law, you can ask us to:\n\n- Tell you what personal information we hold about you\n- Correct information that is wrong or incomplete\n- Delete your information when we no longer need to keep it\n- Stop using your information for a particular purpose\n\nTo make a request, contact us from the email address linked to your account. We may need to confirm your identity before acting on the request.",
    "bodyAr": "في حدود القانون، من حقك تطلب مننا:\n\n- نقولك إيه المعلومات الشخصية اللي عندنا عنك\n- نصحح أي معلومة غلط أو ناقصة\n- نمسح معلوماتك لما نكون مش محتاجين نحتفظ بيها\n- نوقف استخدام معلوماتك في غرض معين\n\nعشان تقدم طلب، كلمنا من الإيميل المربوط بحسابك. ممكن نحتاج نتأكد من هويتك قبل ما ننفذ الطلب."
   },
   {
    "number": "10",
    "titleEn": "Security",
    "titleAr": "الأمان",
    "bodyEn": "We use reasonable technical and organisational measures to protect your information, including secure connections, protected sessions and limited access to records.\n\nNo online system can be guaranteed 100% secure. If you believe your account has been accessed without permission, contact us immediately.",
    "bodyAr": "بنستخدم إجراءات تقنية وتنظيمية مناسبة عشان نحمي معلوماتك، زي الاتصال الآمن والجلسات المحمية وتقييد الوصول للسجلات.\n\nمفيش نظام أونلاين مضمون أمانه 100%. لو حاسس إن حد دخل حسابك من غير إذنك، كلمنا فورًا."
   },
   {
    "number": "11",
    "titleEn": "Children",
    "titleAr": "الأطفال",
    "bodyEn": "The TEMPORARY™ website and accounts are intended for adults.\n\nKids' products should be ordered by a parent or guardian. We do not knowingly create accounts for children.",
    "bodyAr": "موقع TEMPORARY™ والحسابات معمولين للكبار.\n\nمنتجات الأطفال المفروض يطلبها ولي الأمر. إحنا مش بنعمل حسابات للأطفال عن قصد."
   },
   {
    "number": "12",
    "titleEn": "Policy Updates",
    "titleAr": "تحديث السياسة",
    "bodyEn": "We may update this policy from time to time. The updated version will be published on this page with its effective date.",
    "bodyAr": "ممكن نحدّث السياسة دي من وقت للتاني، والنسخة الجديدة هتتنشر في الصفحة دي بتاريخ سريانها."
   },
   {
    "number": "13",
    "titleEn": "Contact",
    "titleAr": "التواصل",
    "bodyEn": "For any question about your personal information or this policy, contact us through the Contact page on the website.",
    "bodyAr": "لأي سؤال عن معلوماتك الشخصية أو عن السياسة دي، تواصل معانا من صفحة \"تواصل معانا\" على الموقع."
   }
  ]
 },
 {
  "policyId": "terms",
  "slug": "terms",
  "order": 4,
  "titleEn": "Terms & Conditions",
  "titleAr": "الشروط والأحكام",
  "subtitleEn": "The rules for using the website and ordering",
  "subtitleAr": "قواعد استخدام الموقع وعمل الطلبات",
  "effectiveEn": "October 2026",
  "effectiveAr": "أكتوبر 2026",
  "introEn": "These Terms & Conditions apply to your use of the official TEMPORARY™ website and to every order you place through it.\n\nBy signing in, using the website or placing an order, you agree to these terms.\n\nThese terms are applied in accordance with applicable Egyptian law. Nothing in these terms is intended to cancel, restrict or waive any mandatory consumer right.",
  "introAr": "الشروط والأحكام دي بتنطبق على استخدامك لموقع TEMPORARY™ الرسمي وعلى كل طلب بتعمله من خلاله.\n\nلما تسجّل دخول أو تستخدم الموقع أو تعمل طلب، يبقى أنت موافق على الشروط دي.\n\nالشروط دي بتتطبق بما يتوافق مع القوانين المصرية السارية، ومفيش فيها حاجة الهدف منها إلغاء أو تقييد أو التنازل عن أي حق إلزامي للمستهلك.",
  "closingEn": "**Not for everyone.**\n**Limited pieces last longer.**\n**EVERYTHING IS TEMPORARY.**",
  "closingAr": "**مش لأي حد.**\n**القطع المحدودة بتعيش أكتر.**\n**EVERYTHING IS TEMPORARY.**",
  "sections": [
   {
    "number": "01",
    "titleEn": "About TEMPORARY™",
    "titleAr": "عن TEMPORARY™",
    "bodyEn": "TEMPORARY™ is a limited-edition clothing brand based in Cairo, Egypt.\n\nOur pieces are released in drops and collections produced in limited quantities. Once a design is sold out, it may not be produced again.",
    "bodyAr": "TEMPORARY™ براند ملابس بإصدارات محدودة، مقرها القاهرة، مصر.\n\nقطعنا بتنزل في دروبس ومجموعات بكميات محدودة، ولما تصميم يخلص، ممكن ما يتعملش تاني."
   },
   {
    "number": "02",
    "titleEn": "Your Account",
    "titleAr": "حسابك",
    "bodyEn": "You sign in to the website with your Google account.\n\nYou are responsible for keeping access to your Google account and your devices secure, and for all activity on your TEMPORARY™ account.\n\nPlease make sure the information in your account and orders is correct and up to date.",
    "bodyAr": "بتسجّل دخولك على الموقع بحساب Google بتاعك.\n\nأنت مسؤول عن أمان حساب Google وأجهزتك، وعن أي نشاط بيحصل على حسابك في TEMPORARY™.\n\nياريت تتأكد إن بياناتك في الحساب والطلبات صحيحة ومحدثة."
   },
   {
    "number": "03",
    "titleEn": "Products and Designs",
    "titleAr": "المنتجات والتصميمات",
    "bodyEn": "We make every effort to show product colours, prints and mockups as accurately as possible. Colours may look slightly different depending on your screen.\n\nMeasurements may vary by 1–2 cm due to production tolerances. Please check the size chart for each product before ordering.\n\nProduct details, materials and care instructions are shown on each product page.",
    "bodyAr": "بنعمل كل اللي نقدر عليه عشان نعرض ألوان المنتجات والطباعة والموكابس بأدق شكل. الألوان ممكن تبان مختلفة شوية حسب الشاشة.\n\nالمقاسات ممكن تختلف 1–2 سم بسبب فروق الإنتاج. ياريت تراجع جدول المقاسات لكل منتج قبل ما تطلب.\n\nتفاصيل المنتج والخامة وتعليمات العناية موجودة في صفحة كل منتج."
   },
   {
    "number": "04",
    "titleEn": "Limited Quantities",
    "titleAr": "الكميات المحدودة",
    "bodyEn": "Each design has a limited production quantity.\n\nAdding a piece to your bag does not reserve it. A piece is reserved only when you place an order, and it stays reserved while the order is awaiting payment.\n\nIf a design sells out, it will be marked as sold out and can no longer be ordered.",
    "bodyAr": "كل تصميم ليه كمية إنتاج محدودة.\n\nإضافة القطعة للسلة مش بتحجزها. القطعة بتتحجز بس لما تعمل الطلب، وبتفضل محجوزة طول ما الطلب مستني الدفع.\n\nلو تصميم خلص، هيظهر عليه \"خلص\" ومش هينفع يتطلب."
   },
   {
    "number": "05",
    "titleEn": "Prices",
    "titleAr": "الأسعار",
    "bodyEn": "All prices are shown in Egyptian pounds (EGP).\n\nPrices, delivery fees and order totals are calculated by the TEMPORARY™ system at the time you place the order. The total shown on your order summary is the amount you pay.\n\nIf a clear pricing error occurs, TEMPORARY™ may contact you to correct it or cancel the order before it is prepared, in accordance with the law.",
    "bodyAr": "كل الأسعار بالجنيه المصري (EGP).\n\nالأسعار ومصاريف التوصيل وإجمالي الطلب بيحسبهم نظام TEMPORARY™ وقت ما تعمل الطلب، والإجمالي اللي ظاهر في ملخص طلبك هو المبلغ اللي هتدفعه.\n\nلو حصل غلط واضح في السعر، من حق TEMPORARY™ تكلمك عشان تصححه أو تلغي الطلب قبل تجهيزه، حسب القانون."
   },
   {
    "number": "06",
    "titleEn": "Placing and Confirming an Order",
    "titleAr": "عمل الطلب وتأكيده",
    "bodyEn": "To place an order, you choose your product, design, print placement, print size, colour, size and quantity, then enter your contact and delivery details and pay online.\n\nYou can order as a guest or sign in with Google.\n\n**An order is accepted and confirmed once the payment succeeds.** Orders that are not paid within the payment window are cancelled automatically.\n\nTEMPORARY™ then begins preparation and production.",
    "bodyAr": "عشان تعمل طلب، بتختار المنتج والتصميم ومكان الطباعة ومقاس الطباعة واللون والمقاس والكمية، وبعدين تكتب بياناتك وبيانات التوصيل وتدفع أونلاين.\n\nتقدر تطلب كضيف أو تسجّل دخول بـ Google.\n\n**الطلب بيتقبل ويتأكد أول ما الدفع ينجح.** والطلبات اللي مش بتتدفع خلال فترة الدفع بتتلغي تلقائيًا.\n\nوبعدها TEMPORARY™ بتبدأ التجهيز والإنتاج."
   },
   {
    "number": "07",
    "titleEn": "Payment",
    "titleAr": "الدفع",
    "bodyEn": "Orders are paid online in full at checkout by card or mobile wallet through Paymob.\n\nThe amount you pay is the total shown on your order summary, including the delivery fee.",
    "bodyAr": "الطلبات بتتدفع أونلاين بالكامل وقت إتمام الطلب بالكارت أو بالمحفظة من خلال Paymob.\n\nالمبلغ اللي بتدفعه هو الإجمالي اللي ظاهر في ملخص طلبك، شامل مصاريف التوصيل."
   },
   {
    "number": "08",
    "titleEn": "Delivery",
    "titleAr": "التوصيل",
    "bodyEn": "Delivery areas, fees and estimated times are explained in the Shipping & Delivery Policy and shown at checkout.",
    "bodyAr": "مناطق التوصيل ومصاريفه والمدد المتوقعة موضحين في سياسة الشحن والتوصيل وبيظهروا في صفحة إتمام الطلب."
   },
   {
    "number": "09",
    "titleEn": "Returns, Exchanges and Defects",
    "titleAr": "الاسترجاع والاستبدال والعيوب",
    "bodyEn": "Returns, exchanges and defect complaints are handled according to the Returns, Exchanges & Product Defects Policy, which preserves all mandatory consumer rights under Egyptian law.",
    "bodyAr": "الاسترجاع والاستبدال وشكاوى العيوب بيتم التعامل معاهم حسب سياسة الاسترجاع والاستبدال وعيوب المنتجات، اللي بتحافظ على كل حقوق المستهلك الإلزامية حسب القانون المصري."
   },
   {
    "number": "10",
    "titleEn": "Cancelling an Order",
    "titleAr": "إلغاء الطلب",
    "bodyEn": "You can ask to cancel an order by contacting us as soon as possible.\n\nOnce an order has entered production, preparation or delivery, cancellation may no longer be possible, subject to your mandatory legal rights.\n\nTEMPORARY™ may cancel an order if it is not paid in time, if the delivery details are incorrect or incomplete, if delivery repeatedly fails, or if the order appears fraudulent. Paid orders cancelled by TEMPORARY™ are refunded through the original payment method.",
    "bodyAr": "تقدر تطلب إلغاء الطلب لو كلمتنا في أسرع وقت.\n\nلو الطلب دخل مرحلة الإنتاج أو التجهيز أو التوصيل، الإلغاء ممكن ميبقاش متاح، مع مراعاة حقوقك القانونية الإلزامية.\n\nومن حق TEMPORARY™ تلغي الطلب لو ما اتدفعش في الوقت المحدد، أو لو بيانات التوصيل غلط أو ناقصة، أو لو التوصيل فشل أكتر من مرة، أو لو الطلب باين إنه احتيالي. والطلبات المدفوعة اللي TEMPORARY™ بتلغيها فلوسها بترجع بنفس طريقة الدفع."
   },
   {
    "number": "11",
    "titleEn": "Intellectual Property",
    "titleAr": "الملكية الفكرية",
    "bodyEn": "All designs, artwork, logos, the TEMPORARY™ name, photos and website content belong to TEMPORARY™ or its licensors.\n\nYou may not copy, reproduce, sell or use them for commercial purposes without written permission from TEMPORARY™.",
    "bodyAr": "كل التصميمات والرسومات واللوجوهات واسم TEMPORARY™ والصور ومحتوى الموقع ملك TEMPORARY™ أو أصحاب التراخيص.\n\nمش مسموح تنسخها أو تعيد إنتاجها أو تبيعها أو تستخدمها لأغراض تجارية من غير إذن مكتوب من TEMPORARY™."
   },
   {
    "number": "12",
    "titleEn": "Acceptable Use",
    "titleAr": "الاستخدام المسموح",
    "bodyEn": "You agree not to:\n\n- Use the website for any unlawful purpose\n- Place false or fraudulent orders\n- Try to interfere with the website, its security or its systems\n- Use automated tools to collect content or place orders\n\nTEMPORARY™ may suspend access to the website for anyone who breaks these terms.",
    "bodyAr": "أنت موافق إنك ما:\n\n- تستخدمش الموقع في أي غرض مخالف للقانون\n- تعملش طلبات وهمية أو احتيالية\n- تحاولش تأثر على الموقع أو أمانه أو أنظمته\n- تستخدمش أدوات أوتوماتيك عشان تجمع محتوى أو تعمل طلبات\n\nومن حق TEMPORARY™ توقف وصول أي حد يخالف الشروط دي للموقع."
   },
   {
    "number": "13",
    "titleEn": "Liability",
    "titleAr": "المسؤولية",
    "bodyEn": "TEMPORARY™ is responsible for providing the products you order in accordance with these terms and the law.\n\nTo the extent permitted by law, TEMPORARY™ is not responsible for indirect losses or for delays caused by circumstances outside its reasonable control.\n\nNothing in these terms limits any liability that cannot be limited under Egyptian law.",
    "bodyAr": "TEMPORARY™ مسؤولة إنها توفر المنتجات اللي طلبتها حسب الشروط دي والقانون.\n\nوفي الحدود اللي يسمح بها القانون، TEMPORARY™ مش مسؤولة عن الخسائر غير المباشرة أو عن التأخير اللي بيحصل بسبب ظروف خارجة عن إرادتها.\n\nومفيش حاجة في الشروط دي بتقلل أي مسؤولية مينفعش تتقلل حسب القانون المصري."
   },
   {
    "number": "14",
    "titleEn": "Changes to These Terms",
    "titleAr": "تعديل الشروط",
    "bodyEn": "TEMPORARY™ may update these terms from time to time. The updated version will be published on this page with its effective date.\n\nThe version that applies to an order is the version in force at the time the order was placed, in accordance with the law.",
    "bodyAr": "من حق TEMPORARY™ تحدّث الشروط دي من وقت للتاني، والنسخة الجديدة هتتنشر في الصفحة دي بتاريخ سريانها.\n\nالنسخة اللي بتنطبق على أي طلب هي النسخة اللي كانت سارية وقت عمل الطلب، حسب القانون."
   },
   {
    "number": "15",
    "titleEn": "Governing Law",
    "titleAr": "القانون المطبق",
    "bodyEn": "These terms are governed by the laws of the Arab Republic of Egypt.",
    "bodyAr": "الشروط دي بتخضع لقوانين جمهورية مصر العربية."
   },
   {
    "number": "16",
    "titleEn": "Contact",
    "titleAr": "التواصل",
    "bodyEn": "For any question about these terms, contact us through the Contact page on the website.",
    "bodyAr": "لأي سؤال عن الشروط دي، تواصل معانا من صفحة \"تواصل معانا\" على الموقع."
   }
  ]
 }
];

/* v12: policy sections rewritten for online payment (applied once by TEMPORARY_V12_UPDATE) */
var V12_POLICY_PATCH = [{"policyId": "shipping", "number": "02", "titleEn": "Payment and Order Confirmation", "titleAr": "الدفع وتأكيد الطلب", "bodyEn": "Orders are paid online at checkout through our secure payment partner, Paymob, by card or mobile wallet.\n\nYour order is confirmed automatically as soon as the payment succeeds, and you receive an order-received email with your order details.\n\n**If the payment is not completed within the payment window shown at checkout, the order is cancelled automatically and the reserved pieces are released.**\n\nPreparation and delivery begin only after the payment is confirmed.", "bodyAr": "الطلبات بتتدفع أونلاين وقت إتمام الطلب من خلال شريك الدفع الآمن بتاعنا Paymob، بالكارت أو بالمحفظة.\n\nطلبك بيتأكد تلقائيًا أول ما الدفع ينجح، وبيوصلك إيميل باستلام الطلب فيه كل التفاصيل.\n\n**لو الدفع ما اكتملش خلال فترة الدفع اللي بتظهر لك وقت إتمام الطلب، الطلب بيتلغي تلقائيًا والقطع اللي كانت محجوزة له بترجع متاحة.**\n\nالتجهيز والتوصيل بيبدأوا بعد تأكيد الدفع بس."}, {"policyId": "shipping", "number": "05", "titleEn": "Estimated Delivery Time", "titleAr": "مدة التوصيل المتوقعة", "bodyEn": "Every piece is made for you after you order. Orders are delivered **within 8 working days** from the date the payment is confirmed.\n\nFriday and Saturday are days off and are not counted as working days.\n\nDelivery times may be affected by public holidays, weather, high-demand periods, the courier's operations or circumstances outside our control.\n\nIf there is a significant delay, we will do our best to inform you.", "bodyAr": "كل قطعة بتتعمل مخصوص ليك بعد ما تطلب. الطلبات بتتوصل **خلال ٨ أيام عمل** من تاريخ تأكيد الدفع.\n\nالجمعة والسبت إجازة ومش بيتحسبوا من أيام العمل.\n\nمدة التوصيل ممكن تتأثر بالإجازات الرسمية أو الطقس أو مواسم الضغط أو شغل شركة الشحن أو ظروف خارجة عن إرادتنا.\n\nلو حصل تأخير كبير، هنحاول نبلغك على قد ما نقدر."}, {"policyId": "shipping", "number": "06", "titleEn": "Payment", "titleAr": "الدفع", "bodyEn": "Orders are paid online in full at checkout by card (Visa, Mastercard, Meeza) or mobile wallet, through Paymob.\n\nYou do not pay the courier anything on delivery. The courier is not authorised to collect money, change prices or apply discounts.\n\nTEMPORARY™ does not see or store your card details. Payments are processed securely by Paymob.", "bodyAr": "الطلبات بتتدفع أونلاين بالكامل وقت إتمام الطلب بالكارت (Visa أو Mastercard أو ميزة) أو بالمحفظة، من خلال Paymob.\n\nمش هتدفع أي حاجة للمندوب وقت الاستلام، والمندوب مش مسموح له ياخد فلوس أو يغيّر الأسعار أو يعمل خصم.\n\nTEMPORARY™ مش بتشوف ولا بتحفظ بيانات الكارت بتاعك. الدفع بيتم بأمان من خلال Paymob."}, {"policyId": "shipping", "number": "07", "titleEn": "Order Status", "titleAr": "حالة الطلب", "bodyEn": "You can follow your order through the following stages:\n\n- Awaiting payment\n- Confirmed\n- Processing\n- Ready for delivery\n- Out for delivery\n- Delivered\n\nAn order may also show as Cancelled if the payment was not completed in time, or if it was cancelled in accordance with our policies.", "bodyAr": "تقدر تتابع طلبك في المراحل دي:\n\n- مستني الدفع\n- اتأكد\n- جاري التجهيز\n- جاهز للتوصيل\n- في الطريق\n- اتسلّم\n\nوممكن الطلب يظهر \"ملغي\" لو الدفع ما اكتملش في الوقت المحدد، أو لو اتلغى حسب سياساتنا."}, {"policyId": "terms", "number": "04", "titleEn": "Limited Quantities", "titleAr": "الكميات المحدودة", "bodyEn": "Each design has a limited production quantity.\n\nAdding a piece to your bag does not reserve it. A piece is reserved only when you place an order, and it stays reserved while the order is awaiting payment.\n\nIf a design sells out, it will be marked as sold out and can no longer be ordered.", "bodyAr": "كل تصميم ليه كمية إنتاج محدودة.\n\nإضافة القطعة للسلة مش بتحجزها. القطعة بتتحجز بس لما تعمل الطلب، وبتفضل محجوزة طول ما الطلب مستني الدفع.\n\nلو تصميم خلص، هيظهر عليه \"خلص\" ومش هينفع يتطلب."}, {"policyId": "terms", "number": "06", "titleEn": "Placing and Confirming an Order", "titleAr": "عمل الطلب وتأكيده", "bodyEn": "To place an order, you choose your product, design, print placement, print size, colour, size and quantity, then enter your contact and delivery details and pay online.\n\nYou can order as a guest or sign in with Google.\n\n**An order is accepted and confirmed once the payment succeeds.** Orders that are not paid within the payment window are cancelled automatically.\n\nTEMPORARY™ then begins preparation and production.", "bodyAr": "عشان تعمل طلب، بتختار المنتج والتصميم ومكان الطباعة ومقاس الطباعة واللون والمقاس والكمية، وبعدين تكتب بياناتك وبيانات التوصيل وتدفع أونلاين.\n\nتقدر تطلب كضيف أو تسجّل دخول بـ Google.\n\n**الطلب بيتقبل ويتأكد أول ما الدفع ينجح.** والطلبات اللي مش بتتدفع خلال فترة الدفع بتتلغي تلقائيًا.\n\nوبعدها TEMPORARY™ بتبدأ التجهيز والإنتاج."}, {"policyId": "terms", "number": "07", "titleEn": "Payment", "titleAr": "الدفع", "bodyEn": "Orders are paid online in full at checkout by card or mobile wallet through Paymob.\n\nThe amount you pay is the total shown on your order summary, including the delivery fee.", "bodyAr": "الطلبات بتتدفع أونلاين بالكامل وقت إتمام الطلب بالكارت أو بالمحفظة من خلال Paymob.\n\nالمبلغ اللي بتدفعه هو الإجمالي اللي ظاهر في ملخص طلبك، شامل مصاريف التوصيل."}, {"policyId": "terms", "number": "10", "titleEn": "Cancelling an Order", "titleAr": "إلغاء الطلب", "bodyEn": "You can ask to cancel an order by contacting us as soon as possible.\n\nOnce an order has entered production, preparation or delivery, cancellation may no longer be possible, subject to your mandatory legal rights.\n\nTEMPORARY™ may cancel an order if it is not paid in time, if the delivery details are incorrect or incomplete, if delivery repeatedly fails, or if the order appears fraudulent. Paid orders cancelled by TEMPORARY™ are refunded through the original payment method.", "bodyAr": "تقدر تطلب إلغاء الطلب لو كلمتنا في أسرع وقت.\n\nلو الطلب دخل مرحلة الإنتاج أو التجهيز أو التوصيل، الإلغاء ممكن ميبقاش متاح، مع مراعاة حقوقك القانونية الإلزامية.\n\nومن حق TEMPORARY™ تلغي الطلب لو ما اتدفعش في الوقت المحدد، أو لو بيانات التوصيل غلط أو ناقصة، أو لو التوصيل فشل أكتر من مرة، أو لو الطلب باين إنه احتيالي. والطلبات المدفوعة اللي TEMPORARY™ بتلغيها فلوسها بترجع بنفس طريقة الدفع."}, {"policyId": "returns", "number": "26", "titleEn": "Refund Details", "titleAr": "بيانات الاسترداد", "bodyEn": "Approved refunds for online payments are returned through the original payment method via Paymob.\n\nTEMPORARY™ may request the reasonable information needed to process the refund securely. Any refund will be handled in accordance with the law and the available refund procedures.", "bodyAr": "المبالغ اللي بيتوافق على استردادها للمدفوعات الأونلاين بترجع بنفس طريقة الدفع من خلال Paymob.\n\nومن حق TEMPORARY™ تطلب المعلومات المعقولة اللازمة لمعالجة الاسترداد بأمان. وأي استرداد بيتم وفقًا للقانون وإجراءات الاسترداد المتاحة."}, {"policyId": "privacy", "number": "02", "titleEn": "Information You Give Us", "titleAr": "المعلومات اللي بتديهالنا", "bodyEn": "When you use the website, you may give us:\n\n- Your name and email address, at checkout or through Google sign-in\n- Your phone number\n- Your date of birth, if you choose to join the founders list\n- Your governorate, area and full delivery address\n- The products, designs, colours, sizes and quantities you choose\n- Messages you send us through the contact form or by email\n\nCard and wallet details are entered on Paymob's secure page. TEMPORARY™ never receives or stores them.", "bodyAr": "وأنت بتستخدم الموقع، ممكن تدينا:\n\n- اسمك وإيميلك، وقت إتمام الطلب أو من خلال تسجيل الدخول بـ Google\n- رقم موبايلك\n- تاريخ ميلادك، لو حبيت تنضم لقائمة الـ Founders\n- المحافظة والمنطقة والعنوان بالتفصيل\n- المنتجات والتصميمات والألوان والمقاسات والكميات اللي بتختارها\n- الرسايل اللي بتبعتها لنا من فورم التواصل أو على الإيميل\n\nبيانات الكارت والمحفظة بتتكتب في صفحة Paymob الآمنة، وTEMPORARY™ عمرها ما بتستلمها ولا بتحفظها."}, {"policyId": "privacy", "number": "05", "titleEn": "How We Use Your Information", "titleAr": "بنستخدم معلوماتك في إيه", "bodyEn": "We use your information to:\n\n- Create and secure your account\n- Keep your bag the same across your devices\n- Process, prepare and deliver your orders\n- Send order emails and order updates\n- Send founders updates and a birthday surprise, only if you chose to join\n- Answer your questions and handle return, exchange and defect requests\n- Prevent fraud and abuse of the store\n- Understand how the store is used, so we can improve it and show relevant ads\n- Comply with our legal obligations", "bodyAr": "بنستخدم معلوماتك عشان:\n\n- نعمل حسابك ونأمّنه\n- نخلي سلتك زي ما هي على كل أجهزتك\n- نستلم طلباتك ونجهزها ونوصّلها\n- نبعت لك إيميلات الطلب والتحديثات\n- نبعت لك أخبار الـ Founders ومفاجأة عيد ميلادك، لو اخترت تنضم بس\n- نرد على أسئلتك ونتعامل مع طلبات الاسترجاع والاستبدال والعيوب\n- نمنع الاحتيال وسوء استخدام المتجر\n- نفهم المتجر بيتستخدم إزاي عشان نحسّنه ونعرض إعلانات مناسبة\n- نلتزم بالتزاماتنا القانونية"}, {"policyId": "privacy", "number": "06", "titleEn": "Who We Share Your Information With", "titleAr": "بنشارك معلوماتك مع مين", "bodyEn": "We do not sell your personal information.\n\nWe share information only when it is needed to run the store, for example with:\n\n- Paymob, our payment partner, which processes your payment\n- Delivery partners, who receive your name, phone number and address\n- Production and fulfilment partners, who receive the order details needed to prepare your pieces\n- Service providers that host our systems, such as Google services used to run the website and store order records\n- Meta (Facebook / Instagram), which receives website activity such as page views and purchases to measure and improve our ads\n- Authorities, when the law requires it\n\nEach party receives only the information it needs for its role.", "bodyAr": "إحنا مش بنبيع معلوماتك الشخصية.\n\nبنشارك المعلومات بس لما تكون محتاجينها عشان نشغّل المتجر، مثلًا مع:\n\n- Paymob، شريك الدفع بتاعنا، وبيعالج عملية الدفع\n- شركات التوصيل، وبياخدوا اسمك ورقم موبايلك وعنوانك\n- شركاء الإنتاج والتجهيز، وبياخدوا تفاصيل الطلب اللي محتاجينها عشان يجهزوا قطعك\n- مقدمي الخدمات اللي بيستضيفوا أنظمتنا، زي خدمات Google اللي بنستخدمها لتشغيل الموقع وحفظ سجلات الطلبات\n- Meta (فيسبوك / انستجرام)، وبتاخد نشاطك على الموقع زي الصفحات اللي فتحتها والمشتريات عشان نقيس إعلاناتنا ونحسّنها\n- الجهات الرسمية، لما القانون يطلب كده\n\nكل جهة بتاخد بس المعلومات اللي محتاجاها لدورها."}, {"policyId": "shipping", "number": "09", "titleEn": "Failed Delivery Attempts", "titleAr": "محاولات التوصيل اللي ما نجحتش", "bodyEn": "If the courier cannot reach you or cannot deliver the order to the address provided, another attempt may be arranged.\n\nIf delivery fails repeatedly because the customer is unavailable, unreachable or refuses to receive the order without a valid reason, TEMPORARY™ may cancel the order. Any refund in that case is handled according to the Returns, Exchanges & Product Defects Policy and the law.", "bodyAr": "لو المندوب ما قدرش يوصل لك أو ما قدرش يسلّم الطلب على العنوان المكتوب، ممكن نرتب محاولة تانية.\n\nلو التوصيل فشل أكتر من مرة لأن العميل مش متاح أو مش بيرد أو رفض يستلم من غير سبب مقبول، من حق TEMPORARY™ تلغي الطلب. وأي استرداد في الحالة دي بيتم حسب سياسة الاسترجاع والاستبدال وعيوب المنتجات والقانون."}];
