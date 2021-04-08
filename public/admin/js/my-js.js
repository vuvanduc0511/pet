$(document).ready(function() {

	let $btnSearch            = $("button#btn-search");
	let $btnClearSearch       = $("button#btn-clear-search");
	let $selectChangeAttrAjax = $("select.select-ajax");
	let $inputOrdering        = $("input.ordering");
	let $inputLink            = $("input.link");
	let $btnStatus            = $(".btn-status");
	let $btnIsHome            = $(".btn-ishome");
	let $inputSearchField     = $("input[name  = search_field]");
	let $inputSearchValue     = $("input[name  = search_value]");
	let $selectChangeAttr     = $("select[name = select_change_attr]");
	let $currency             = $('.money');
	let $percent              = $('input[name=percent]');
	let $accepted             = $('.accepted');
	let $date_start           = $('input[name=date_start]');
	let $date_end             = $('input[name=date_end]');

	//format price
	$("#price,#price_sale").val(function(index, value) {
		return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	});

	// Ajax Change Ordering
	$inputOrdering.on("change", function () {
		let $currentElement = $(this);
		let value = $(this).val();
		let $url = $(this).data("url");
		$url = $url.replace("value_new", value);

		if (checkInputOrdering(value, 1)) {
            callAjax($currentElement, $url, 'ordering');
        }

	});
	// Ajax Change Link
	$inputLink.on("keyup", function () {

	    
		let $currentElement = $(this);
		let value = $(this).val();
		// console.log(value);
		
		let $url = $(this).data("url");
		// $url = $url.replace("value_new", value);


		callAjax($currentElement, $url, 'link',value);


	});

	// Ajax Change Status
	$btnStatus.click(function (e) {
		e.preventDefault();
		let $currentElement = $(this);
		let $url            = $currentElement.attr("href");

		callAjax($currentElement, $url, 'status');
	});

	// Ajax Change Is Home
	$btnIsHome.click(function (e) {
		e.preventDefault();
		let $currentElement = $(this);
		let $url            = $currentElement.attr("href");

		callAjax($currentElement, $url, 'ishome');
	});
	

	// Ajax Change SelectBox Value
	$selectChangeAttrAjax.on("change", function () {
		let $currentElement = $(this);
		let select_value = $(this).val();
		let $url = $(this).data("url");
		$url = $url.replace("value_new", select_value);

		callAjax($currentElement, $url, 'select');
	});
	
	$btnSearch.click(function() {

		var pathname	= window.location.pathname;
		let params 		= ['filter_status'];
		let searchParams= new URLSearchParams(window.location.search);	// ?filter_status=active

		let link		= "";
		$.each( params, function( key, param ) { // filter_status
			if (searchParams.has(param) ) {
				link += param + "=" + searchParams.get(param) + "&" // filter_status=active
			}
		});

		let search_field = $inputSearchField.val();
		let search_value = $inputSearchValue.val();

		if(search_value.replace(/\s/g,"") == ""){
			alert("Nhập vào giá trị cần tìm !!");
		} else {
			window.location.href = pathname + "?" + link + 'search_field='+ search_field + '&search_value=' + search_value;
		}
	});

	$btnClearSearch.click(function() {
		var pathname	= window.location.pathname;
		let searchParams= new URLSearchParams(window.location.search);

		params 			= ['filter_status'];

		let link		= "";
		$.each( params, function( key, param ) {
			if (searchParams.has(param) ) {
				link += param + "=" + searchParams.get(param) + "&"
			}
		});

		window.location.href = pathname + "?" + link.slice(0,-1);
	});

	$('#lfm').filemanager('image');

	// Filter by category
	$('select[name="filter_category"]').on("change", function() {
		var pathname = window.location.pathname;
		let searchParams = new URLSearchParams(window.location.search);
		params = [
			"filter_status",
			"search_field",
			"search_value",
		];

		let link = "";
		$.each(params, function(key, value) {
			if (searchParams.has(value)) {
				link += `${value}=${searchParams.get(value)}&`;
			}
		});

		let filter_category = $(this).val();

		window.location.href = `${pathname}?${link}filter_category=${filter_category}`;
	});
	
	// Sort
	$("a.select-field").click(function(e) {
		e.preventDefault();

		let field 		= $(this).data('field');
		let fieldName 	= $(this).html();
		$("button.btn-active-field").html(fieldName + ' <span class="caret"></span>');
		$inputSearchField.val(field);
	});

	$('.btn-delete').on('click', function() {
		if(!confirm('Bạn có chắc muốn xóa phần tử?'))
			return false;
	});

	/* ---------- Setting ---------- */
	// Tag Input
	$("#tags-input").tagsinput({
		confirmKeys: [32],
	});

	if( controllerName == 'discount' ){
		// Time
		let time_start = 'DD-MM-YYYY HH:mm:ss';
		$date_start.datetimepicker({
			defaultDate: $.now(),
			format     : time_start,
		});		
		$date_end.datetimepicker({
			defaultDate: $.now(),
			format     : time_start,
		});		

		// Currency
		$currency.simpleMoneyFormat();
		$accepted.simpleMoneyFormat();

		// Percent
		$percent.change(function() {
			$(this).val(function(index, old) { return old.replace(/[^0-9]/g, '') + ' %'; });
		});

		// Disable Currency & Percent
		clearOppersiteInput($currency, $percent);

		// Clear Input Special Character
		$('input[type=submit]').click(function (e) {
			let newCurrency = parseInt( regex($currency.val()) );
			let newPercent  = parseInt( regex($percent.val()) );
			let newAccepted = parseInt( regex($accepted.val()) );

			if ( !isNaN(newCurrency) ) {
				$currency.val(newCurrency);
			}
			
			if ( !isNaN(newPercent) ) {
				$percent.val(newPercent);
			}

			if ( !isNaN(newAccepted) ) {
				$accepted.val(newAccepted);
			}

			// $accepted.val(newAccepted);
			// $accepted.val(newAccepted);

			// Update New Time Format
			var longDateFormat  = 'dd/MM/yyyy HH:mm:ss';
			let old_start_date = $date_start.val();
			let newdate_start  = $.format.date(old_start_date, longDateFormat);
			$date_start.val(newdate_start);

			let old_end_date = $date_end.val();
			let newdate_end  = $.format.date(old_end_date, longDateFormat);
			$date_end.val(newdate_end);

			if ( !(
					checkInputOrdering(newCurrency) || 
					checkInputOrdering(newPercent) ||
					checkInputOrdering(newAccepted))
				){
					e.preventDefault();
			}

		})

	}

	// Auto Select Input
	$('form').find('input[type=text]').filter(':visible:first').focus().select();

	// Slug
	switch (controllerName) {
		case 'article' : 
		case 'category': 
			$.slugify("Ätschi Bätschi"); // "aetschi-baetschi"
			$('#slug').slugify('#name'); // Type as you slug
		break;
	
	}

	// Modal
	$('#myModal').on('shown.bs.modal', function () {
		// $('#myInput').trigger('focus');
		// ('input[name=name]').blur().not();
		$inputNewCategory.focus().select();
	})

	// Close Modal
	$('button.modal-category-save').click(function (e) {
		e.preventDefault();
		let new_category_name = $inputNewCategory.val();
		let new_parent_id = $selectNewCategory.val();

		// console.log('gg = ' + gg);
		// console.log('ff = ' + ff);
		// console.log('hh = ' + hh);

		if (new_category_name != '' && new_parent_id != '') {
	
			let $url = $inputNewCategory.data('url');
			$url = $url.replace("id_new", new_parent_id).replace("name_new", new_category_name);

			// callAjax($(this), $url, 'popup');
			callAjax($selectNewCategory, $url, 'popup');
		}

		$inputNewCategory.val('');
		$selectNewCategory.find('option:selected').remove();
		$('#exampleModal').modal('hide');
		return false;
	})

	// Active Menu Side Bar
	let child_Li = $(`#sidebar-menu li`);
	var parentDiv = [];
	
	child_Li.each((index, val) => {
		parentDiv.push(val.id);
		// console.log(`key = ${index} - param = ${val}`);
	});

	$(parentDiv).each((index, val) => {
		// console.log('val = ' + val);

		if(controllerName == val) {
			let choose = $(`#${val}`);
			choose.addClass('current-page');
			choose.parent().css('display', 'block');
			choose.parent().parent().addClass('active');
		}
	});
	//format number when typing
	$('#price,#price_sale').keyup(function(event) {
		// skip for arrow keys
		
		if(event.which >= 37 && event.which <= 40) return;

		// format number
		$(this).val(function(index, value) {
			return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
		});
	});



	// allStorage();

	// $('.tags').tagsInput({
	// 	'defaultText': '',
	// 	'width': '100%'
	// });
});

