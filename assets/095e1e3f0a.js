var feedback_Methods={selectedRating:0,systemProperties:null,isArabic:"ar-sa"==_spPageContextInfo.currentCultureName.toLowerCase(),authUrl:"https://services.moh.gov.sa/ServiceBus/OAuth/api/Auth/GetAuth",apiUrl:"https://services.moh.gov.sa/ServiceBus/MOH_FeedBack/MOHFeedback.svc",ratingApiUrl:"https://services.moh.gov.sa/ServiceBus/Common/api/Portal",configurations:null,selectedOptionMaster:null,cookieName:"FeedBack",ratingCookieName:"Rating",init:function(){feedback_Methods.getFeedbackDetails();feedback_Methods.renderPageRating();feedback_Methods.token=sessionStorage.getItem('authtoken');if(!feedback_Methods.token)feedback_Methods.getToken();},getToken:function(){$.ajax({async:!0,crossDomain:!0,url:feedback_Methods.authUrl,method:"GET",success:function(response){sessionStorage.setItem('authtoken',response);feedback_Methods.token=response}})},getApiRequest_Base:function(){return{IsArabic:feedback_Methods.isArabic,IPAddress:"10.10.10.10",PageUrl:window.location.href,City:"Riyadh",Region:"Riyadh",Country:"Saudi Arabia",Location:"24.000,24.000",IsMobile:window.matchMedia("(max-width: 767px)").matches,BrowserInfo:JSON.stringify(getBrowserInfo())}},getFeedbackDetails:function(){var pageUrl=window.location.href;var request={IsArabic:feedback_Methods.isArabic,IPAddress:"10.10.10.10",PageUrl:pageUrl.split("?")[0]};$.support.cors=!0;$.ajax({type:"POST",url:feedback_Methods.apiUrl+"/Feddback_Initiate",data:JSON.stringify(request),contentType:"application/json; charset=utf-8",success:function(response){if(response.StatusCode==200){feedback_Methods.configurations=response.Result;feedback_Methods.renderValues()}},error:function(error){console.log(error)}})},urlExistsInRatingLocalstorage:function(url){var storage=localStorage.getItem(feedback_Methods.ratingCookieName);if(storage)return storage.includes(url)>0;else return!1},getRatingDetails:function(){var pageUrl=window.location.href;var request={IsArabic:feedback_Methods.isArabic,IPAddress:"10.10.10.10",PageUrl:pageUrl.split("?")[0]};$.support.cors=!0;$.ajax({type:"POST",headers:{"authorization":"bearer "+sessionStorage.getItem('authtoken')},url:feedback_Methods.ratingApiUrl+"/Rating_Initiate?url="+pageUrl.split("?")[0]+"&isArabic="+feedback_Methods.isArabic,contentType:"application/json; charset=utf-8",success:function(response){var avgRating=0;$("#rating-value").html(avgRating);$('#total-ratings').html("0"+(feedback_Methods.isArabic?" التقييمات ":" Ratings"));if(response.Data&&response.Success){$('#rating-value').html(response.Data.Average);$('#total-ratings').html(response.Data.TotalRatings+(feedback_Methods.isArabic?" التقييمات ":" Ratings"));avgRating=parseFloat($("#rating-value").text());if(feedback_Methods.urlExistsInRatingLocalstorage(window.location.href)){$('#btn-open-form').hide()}}else if(!response.Success&&!response.Data){$('#rating-text').html('')}let summaryHTML='';for(let i=1;i<=5;i++){if(avgRating>=i){summaryHTML+=`
                <span class="fa-stack star-display mx-1">
                    <i class="fa-solid fa-star fa-stack-1x text-theme-green"></i>
                </span>`}else if(avgRating>=i-0.5){summaryHTML+=`
                <span class="fa-stack star-display mx-1">
                    <i class="fa-solid fa-star fa-stack-1x" style="color: #e4e5e9;"></i>
                    <i class="fa-solid fa-star-half fa-stack-1x text-theme-green"></i>
                </span>`}else{summaryHTML+=`
                <span class="fa-stack star-display mx-1">
                    <i class="fa-solid fa-star fa-stack-1x" style="color: #e4e5e9;"></i>
                </span>`}}$("#summary-stars").html(summaryHTML);$('#rating-text').text((feedback_Methods.isArabic?"تم تقييم هذه الخدمة بمتوسط ":"This service is rated with an average of "))},error:function(error){console.log(error)}})},setRating:function(value){feedback_Methods.selectedRating=value;feedback_Methods.renderStars(value);var pageUrl=window.location.href;pageUrl=pageUrl.split("?")[0];pageUrl=pageUrl.split("#")[0];var request={IsArabic:feedback_Methods.isArabic,IPAddress:"10.10.10.10",PageUrl:pageUrl};$.ajax({async:!0,crossDomain:!0,url:feedback_Methods.ratingApiUrl+"/Rating_Submit",method:"POST",headers:{"content-type":"application/x-www-form-urlencoded","authorization":"bearer "+sessionStorage.getItem('authtoken')},data:{PageUrl:request.PageUrl,Stars:value,IPAddress:request.IPAddress,IsMobile:!1,IsArabic:request.IsArabic,BrowserInfo:JSON.stringify(getBrowserInfo()),},success:function(response){if(response.Data&&response.Success){$('#rating-text').text((feedback_Methods.isArabic?"تم تقييم هذه الخدمة بمتوسط ":"This service is rated with an average of "));$('#rating-value').html(response.Data.Average);$('#total-ratings').html(response.Data.TotalRatings+(feedback_Methods.isArabic?" التقييمات ":" Ratings"));feedback_Methods.setLocalstorage(feedback_Methods.ratingCookieName,pageUrl,1);$("#view-form").addClass("d-none").removeClass("d-block");$("#submitted-rating-text").text(feedback_Methods.selectedRating.toFixed(1));let successHTML='';for(let i=1;i<=5;i++){if(selectedRating>=i){successHTML+=`
                    <span class="fa-stack star-display mx-1">
                        <i class="fa-solid fa-star fa-stack-1x text-theme-green"></i>
                    </span>`}else{successHTML+=`
                    <span class="fa-stack star-display mx-1">
                        <i class="fa-solid fa-star fa-stack-1x" style="color: #e4e5e9;"></i>
                    </span>`}}$("#success-stars").html(successHTML);$viewSuccess.removeClass("d-none").addClass("d-flex")}}})},renderStars:function(rating){$(".newstar").each(function(){let value=parseInt($(this).data("value"));$(this).removeClass("full half");if(value<=rating){$(this).addClass("full")}else if(value-0.5===rating){$(this).addClass("half")}})},renderPageRating:function(){var cookie=feedback_Methods.getPageCookie(feedback_Methods.ratingCookieName);$('#rating-desc').text((feedback_Methods.isArabic?" أخبرنا برأيك في هذه الخدمة ":" Tell us what you think of this service"));$('#rating-desc2').text((feedback_Methods.isArabic?" يرجى عدم تضمين معلومات شخصية أو مالية. سيتم إرسال تقييمك وتسجيله لتحسين الخدمات. ":" Please don't include personal or financial information. Your review will be submitted and recorded to improve services."));$('#rating-ques').text((feedback_Methods.isArabic?" كيف تقيم هذه الخدمة؟ ":" How would you rate this service?"));$('#rating-ques2').text((feedback_Methods.isArabic?" قيم تجربتك من (1) ضعيف إلى (5) ممتاز ":" Rate your experience from (1) poor to (5) excellent"));$('#btn-submit').text((feedback_Methods.isArabic?" إرسال":" Submit"));$('#btn-close-form').html("<i class='fa-regular fa-circle-xmark ms-2 fs-5'></i>"+(feedback_Methods.isArabic?" اغلاق ":" Close"));$('#rating-feedback').text((feedback_Methods.isArabic?" اخبرنا عن تجربتك في هذه الخدمة":" Feedback"));$('#rating-message').text((feedback_Methods.isArabic?" لقد قيّمت هذه الخدمة بـ ":" You rated this service as"));$('#rating-message2').text((feedback_Methods.isArabic?" تم إرسال ملاحظاتك! ":" Your feedback is submitted! "));$('#btn-open-form').text((feedback_Methods.isArabic?"قيم هذه الخدمة":" Rate the service "));if(feedback_Methods.isArabic)$('#rating-rules').html(' لمزيد من المعلومات يمكنك مراجعة <a href="#" class="link-theme-green">بيان المشاركة الإلكترونية</a> و<a href="#" class="link-theme-green">قواعد الاشتراك.</a>');const $viewSummary=$("#view-summary");const $viewForm=$("#view-form");const $viewSuccess=$("#view-success");const $btnOpen=$("#btn-open-form");const $btnClose=$("#btn-close-form");const $btnSubmit=$("#btn-submit");const $formStars=$(".star-input");let selectedRating=0;function fillFormStars(rating){$formStars.each(function(index){if(index<rating){$(this).addClass("active")}else{$(this).removeClass("active")}})}$formStars.on("mouseenter",function(){const rating=parseInt($(this).attr("data-value"));fillFormStars(rating)});$formStars.on("click",function(){selectedRating=parseInt($(this).attr("data-value"));feedback_Methods.selectedRating=selectedRating;fillFormStars(selectedRating)});$("#form-stars").on("mouseleave",function(){fillFormStars(selectedRating)});selectedRating=0;fillFormStars(selectedRating);$btnOpen.on("click",function(){$viewSummary.addClass("d-none").removeClass("d-flex");$viewForm.removeClass("d-none").addClass("d-block")});$btnClose.on("click",function(){$viewForm.addClass("d-none").removeClass("d-block");$viewSummary.removeClass("d-none").addClass("d-flex")});$btnSubmit.on("click",function(){feedback_Methods.setRating(feedback_Methods.selectedRating);$viewForm.addClass("d-none").removeClass("d-block");$("#submitted-rating-text").text(feedback_Methods.selectedRating.toFixed(1));let successHTML='';for(let i=1;i<=5;i++){if(feedback_Methods.selectedRating>=i){successHTML+=`
                    <span class="fa-stack star-display mx-1">
                        <i class="fa-solid fa-star fa-stack-1x text-theme-green"></i>
                    </span>`}else{successHTML+=`
                    <span class="fa-stack star-display mx-1">
                        <i class="fa-solid fa-star fa-stack-1x" style="color: #e4e5e9;"></i>
                    </span>`}}$("#success-stars").html(successHTML);$viewSuccess.removeClass("d-none").addClass("d-flex")});if(cookie!=null&&feedback_Methods.urlExistsInRatingLocalstorage(window.location.href)){$("#rating-body").html(`
                <div class="alert alert-success mt-4">
                    ${feedback_Methods.configurations.ResponseSuccessMessage}
                </div>
            `);$(".rating").attr("style","display:none !important;")}},renderValues:function(){var cookie=feedback_Methods.getPageCookie(feedback_Methods.cookieName);var html="";html+=`
        <div class="bg-white feedback-widget">

            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                <div id="feedback-buttons" class="d-flex align-items-center gap-3 flex-wrap">

                    <span class="text-dark fs-6 feedbackqus">
                        ${feedback_Methods.configurations.QuestionDescription}
                    </span>

                    ${feedback_Methods.getOptionMaster_html()}

                </div>

                <div id="feedback-stats">

                    <span class="text-body-secondary fs-6">
                        ${feedback_Methods.renderResponseCount()}
                    </span>

                </div>

                <div id="feedback-close-wrapper">

                    <button type="button"
                            class="btn btn-link btn-close-custom p-0 d-flex align-items-center gap-1 fs-6" style="display:none !important"
                            id="btn-close">

                        ${feedback_Methods.isArabic ? "إغلاق" : "Close"}
                        <i class="fa-light fa-circle-xmark"></i>

                    </button>

                </div>

            </div>

            <div id="feedback-body" class="mt-5 fade-in"></div>

        </div>
        `;$(".feedback-container").html(html);if(cookie!=null&&feedback_Methods.urlExistsInLocalstorage(window.location.href)){$("#feedback-body").html(`
                <div class="alert alert-success mt-4" role="alert">
                    ${feedback_Methods.configurations.ResponseSuccessMessage}
					<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `);$("#feedback-close-wrapper").attr("style","display:none !important;");$("#feedback-buttons").attr("style","display:none !important;")}},renderResponseCount:function(){var totalResponses=0;var selectedResponses=0;if(feedback_Methods.configurations.StatisticsColl!=null&&feedback_Methods.configurations.StatisticsColl.length>0){$.each(feedback_Methods.configurations.StatisticsColl,function(i,item){totalResponses+=item.ResponseCount});var selected=$.grep(feedback_Methods.configurations.StatisticsColl,function(e){return(e.OptionMasterId==feedback_Methods.configurations.DefaultOptionId)});selectedResponses=selected.length>0?selected[0].ResponseCount:0}var text=feedback_Methods.configurations.StatisticsDescription;text=text.replace("{0}",selectedResponses);text=text.replace("{1}",totalResponses);return text},renderOptionDetails:function(){var html="";html+=`
        <div class="row gx-5">

            <div class="col-md-6 mb-4 mb-md-0">

                <h6 class="mb-3 fw-bold text-dark">
${feedback_Methods.isArabic ? "يرجى إخبارنا بالسبب " : "Please tell us why "} 
                    <span class="text-body-secondary fw-normal fs-6 ms-1">
					 ${feedback_Methods.isArabic ? " (حدد ما يصل إلى خيارين)" : " (you can select multiple options)"} 
                        
                    </span>

                </h6>

                ${feedback_Methods.getOptionDetail_html()}

            </div>

            <div class="col-md-6">

                <label class="form-label text-dark mb-2">
                    
					${feedback_Methods.isArabic ? "تعليق" : "Feedback"}
					
                </label>

                <textarea class="form-control txt_more_comments_global"
                          rows="5"
                          maxlength="250"
                          placeholder=""></textarea>

            </div>

        </div>
		
		 </div>
		 <div class="row gx-5">
		 <div class="col-md-6">
		  <label class="form-label text-dark mb-2">
                    
					${feedback_Methods.isArabic ? "أنا" : "I am a "}
					
                </label>
			<input type="radio" value="1"  name="Gender">${feedback_Methods.isArabic ? "ذكر" : "Male"}</input>
			<input type="radio" value="2"  name="Gender">${feedback_Methods.isArabic ? "انثى" : "Female"}</input>
		 </div>

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end mt-4 pt-3">

            <p class="mb-3 mb-md-0 text-dark">

${feedback_Methods.isArabic ? "لمزيد من المعلومات يمكنك مراجعة <a href='https://www.moh.gov.sa/E-Participation/Pages/default.aspx' class='text-feedback text-decoration-underline'>بيان المشاركة الإلكترونية </a> و <a href='https://www.moh.gov.sa/Ministry/eParticipation/Pages/default.aspx' class='text-feedback text-decoration-underline'> قواعد المشاركة</a>" : "For more information you may review<a href='https://www.moh.gov.sa/en/E-Participation/Pages/default.aspx' class='text-feedback text-decoration-underline'>e-participation statement</a>and<a href='https://www.moh.gov.sa/en/Ministry/eParticipation/Pages/default.aspx' class='text-feedback text-decoration-underline'>rules of engagement</a>"}

            </p>

            <div class="d-flex gap-2">

                <button id="btnFeedback_Cancel"
                        type="button"
                        class="btn btn-secondary px-4 py-2">

                     ${feedback_Methods.isArabic ? "إلغاء" : "Cancel"}

                </button>

                <button id="btnFeedback_Submit"
                        type="button"
                        class="btn btn-feedback px-4 py-2 fw-medium"
                        disabled>

                     ${feedback_Methods.isArabic ? "إرسال" : "Submit"}

                </button>

            </div>

        </div>
        `;$("#feedback-body").html(html)},getOptionMaster_html:function(){var html="";$.each(feedback_Methods.configurations.OptionColl,function(i,item){html+=`
                <button type="button"
                        class="btn btn-feedback px-4 fw-medium option-master"
                        id="${item.OptionMasterId}">

                    ${item.OptionMasterText}

                </button>
                `});return html},getOptionDetail_html:function(){var html="";var selected=$.grep(feedback_Methods.configurations.OptionColl,function(e){return(e.OptionMasterId==feedback_Methods.selectedOptionMaster)})[0];$.each(selected.ChildOptioncoll,function(i,item){html+=`
                <div class="form-check mb-2">

                    <input class="form-check-input chkFeedbackOptions"
                           type="checkbox"
                           name="chkFeedbackOptions"
                           data-comments="${item.IsCommentsEnabled}"
                           id="chk_${feedback_Methods.selectedOptionMaster}_${item.OptionDetailsId}"
                           value="${item.OptionDetailsId}">

                    <label class="form-check-label text-dark"
                           for="chk_${feedback_Methods.selectedOptionMaster}_${item.OptionDetailsId}">

                        ${item.OptionDetailsText}

                    </label>

                </div>
                `});return html},onChange_OptionMaster:function(e){$(".option-master").removeClass("selected");$(e.target).addClass("selected");feedback_Methods.selectedOptionMaster=parseFloat(e.target.id);$("#btn-close").show();feedback_Methods.renderOptionDetails()},onChange_OptionSelection:function(e){var count=$("input[name='chkFeedbackOptions']:checked").length;if(count<=0){$("#btnFeedback_Submit").prop("disabled",!0)}else{$("#btnFeedback_Submit").prop("disabled",!1)}if(count>feedback_Methods.configurations.MaxOptionsAllowed){$(e.target).prop("checked",!1);e.preventDefault();e.stopPropagation();return}},onClick_FeedbackCancel:function(){feedback_Methods.selectedOptionMaster=null;$(".option-master").removeClass("selected");$("#feedback-body").html("")},onClick_FeedbackSubmit:function(){var request=feedback_Methods.getApiRequest_Base();var options=[];$.each($("input[name='chkFeedbackOptions']:checked"),function(i,checkbox){options.push({OptionDetailsId:$(checkbox).val(),IsCommentsRequired:$(checkbox).attr("data-comments")=="true",Comments:$(".txt_more_comments_global").val()})});request.QuestionId=feedback_Methods.configurations.QuestionId;request.OptionMasterId=feedback_Methods.selectedOptionMaster;request.Options=options;$.ajax({type:"POST",url:feedback_Methods.apiUrl+"/Feddback_Submit",data:JSON.stringify(request),contentType:"application/json; charset=utf-8",success:function(response){$("#feedback-body").html(`
                    <div class="alert alert-success" role="alert">
                        ${feedback_Methods.isArabic ? "شكرا لك لقد تم ارسال ملاحظتك بنجاح !":"Thank you, your feedback has been sent successfully!"}
						<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                `);if(response.StatusCode==200){feedback_Methods.configurations.StatisticsColl=response.Result.StatisticsColl;$("#feedback-stats").html(`
                        <span class="text-body-secondary fs-6">
                            ${feedback_Methods.renderResponseCount()}
                        </span>
                    `);$("#feedback-close-wrapper").attr("style","display:none !important;");$("#feedback-buttons").attr("style","display:none !important;");feedback_Methods.setPageCookie(feedback_Methods.cookieName,window.location.href,1);feedback_Methods.setLocalstorage(feedback_Methods.cookieName,window.location.href,1)}},error:function(error){console.log(error)}})},setPageCookie:function(name,value,days){var expires="";if(days){var date=new Date();date.setTime(date.getTime()+(days*24*60*60*1000));expires="; expires="+date.toUTCString()}document.cookie=name+"="+(value||"")+expires+"; path=/"},getPageCookie:function(name){var nameEQ=name+"=";var cookies=document.cookie.split(";");for(var i=0;i<cookies.length;i++){var cookie=cookies[i];while(cookie.charAt(0)==" "){cookie=cookie.substring(1)}if(cookie.indexOf(nameEQ)==0){return cookie.substring(nameEQ.length,cookie.length)}}return null},getPageCookieValue:function(name){var nameEQ=name+"=";var cookies=document.cookie.split(";");for(var i=0;i<cookies.length;i++){var cookie=cookies[i].trim();if(cookie.indexOf(nameEQ)===0){return decodeURIComponent(cookie.substring(nameEQ.length))}}return null},setLocalstorage:function(name,value){var storage=feedback_Methods.getLocalstorage(feedback_Methods.cookieName);if(storage)value=storage+";"+value;localStorage.setItem(name,value)},getLocalstorage:function(name){return localStorage.getItem(name)},urlExistsInLocalstorage:function(url){var storage=localStorage.getItem(feedback_Methods.cookieName);if(storage)return storage.includes(url)>0;else return!1}};function getBrowserInfo(){return{Browsername:navigator.appName,FullVersion:navigator.appVersion,MajorVersion:navigator.appVersion,AppName:navigator.appName,UserAgent:navigator.userAgent}}$(document).ready(function(){var token=sessionStorage.getItem('authtoken');if(!token){setTimeout(()=>{feedback_Methods.getRatingDetails();},2000);}else{feedback_Methods.getRatingDetails();}$("#pageRating").on("click",".newstar",function(e){let starValue=parseInt($(this).data("value"));let offset=e.pageX-$(this).offset().left;let width=$(this).width();feedback_Methods.selectedRating=starValue;feedback_Methods.setRating(feedback_Methods.selectedRating)});$(".feedback-container").on("click",".option-master",function(e){feedback_Methods.onChange_OptionMaster(e)});$(".feedback-container").on("click",".chkFeedbackOptions",function(e){feedback_Methods.onChange_OptionSelection(e)});$(".feedback-container").on("click","#btnFeedback_Cancel",function(){feedback_Methods.onClick_FeedbackCancel();$("#btn-close").css("cssText","display:none !important;")});$(".feedback-container").on("click","#btnFeedback_Submit",function(){feedback_Methods.onClick_FeedbackSubmit()});$(".feedback-container").on("keyup",".txt_more_comments_global",function(){this.value=this.value.replace(/(<([^>]+)>)/gi,"");this.value=this.value.replace(/(^\w+:|^)\/\//,"")});$(".feedback-container").on("click","#btn-close",function(){feedback_Methods.onClick_FeedbackCancel();$("#btn-close").css("cssText","display:none !important;")});feedback_Methods.init()})