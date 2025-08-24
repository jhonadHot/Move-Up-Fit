document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    // Fechar menu ao clicar fora dele
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });
});

function toggleSubmenu(event) {
    event.preventDefault();
    const submenu = event.target.nextElementSibling;
    submenu.classList.toggle('open');
}