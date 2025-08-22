// Sistema de permissões
class Permissions {
    static isMaster() {
        return window.userLevel === 'master';
    }

    static isUsuario() {
        return window.userLevel === 'usuario';
    }

    static checkPermission(requiredLevel) {
        if (requiredLevel === 'master' && !this.isMaster()) {
            alert('Acesso negado. Apenas usuários MASTER podem acessar esta funcionalidade.');
            return false;
        }
        return true;
    }

    static hideElementsForUsers() {
        if (this.isUsuario()) {
            // Aqui você pode esconder elementos específicos para usuários comuns
            // Exemplo: document.querySelectorAll('.master-only').forEach(el => el.style.display = 'none');
        }
    }

    static showUserInfo() {
        const userInfo = document.createElement('div');
        userInfo.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px; z-index: 9999;';
        userInfo.textContent = this.isMaster() ? 'MASTER' : 'USUÁRIO';
        document.body.appendChild(userInfo);
    }
}