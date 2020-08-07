// file input
function previewImage() {
	const cover = document.querySelector('#cover');
	const coverLabel = document.querySelector('.custom-file-label');
	const imgPreview = document.querySelector('.img-preview');

	coverLabel.textContent = cover.files[0].name;

	const fileCover = new FileReader();
	fileCover.readAsDataURL(cover.files[0]);

	fileCover.onload = function (e) {
		imgPreview.src = e.target.result;
	};
}
