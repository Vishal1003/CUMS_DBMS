$(document).ready(function () {
  // Set default value of calendar as today's date
  const today = new Date();
  const year = today.getFullYear().toString();
  let month = (today.getMonth() + 1).toString();
  let day = today.getDate().toString();
  if (month.length == 1) {
    month = '0' + month;
  }
  if (day.length == 1) {
    day = '0' + day;
  }
  let date = year + '-' + month + '-' + day;
  $('#date-input').val(date);

  // Date onChange handle
  $('#date-input').change(function () {
    const attendance_date = $('#date-input').val();
    $("input[type='checkbox']").each(function () {
      const isPresent = $(this).prop('checked');
    });
  });

  //   Mark all present button
  $('#mark-all-present').click(function () {
    $("input[type='checkbox']").each(function () {
      const s_id = $(this).attr('id');
      $(`input[name=${s_id}]`).val('True');
      $(this).prop('checked', true);
    });
  });
  //   Mark all absent button
  $('#mark-all-absent').click(function () {
    $("input[type='checkbox']").each(function () {
      const s_id = $(this).attr('id');
      $(`input[name=${s_id}]`).val('False');
      $(this).prop('checked', false);
    });
  });

  // onClick checkbox toggle
  $("input[type='checkbox']").click(function () {
    const s_id = $(this).attr('id');
    let isPresent = $(`input[name=${s_id}]`).val();
    if (isPresent == 'False') {
      isPresent = 'True';
    } else {
      isPresent = 'False';
    }
    $(`input[name=${s_id}]`).val(isPresent);
  });
});
