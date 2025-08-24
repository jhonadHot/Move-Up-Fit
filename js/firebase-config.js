// Configuração do Firebase - SUBSTITUA PELAS SUAS CREDENCIAIS
const firebaseConfig = {
  apiKey: "AIzaSyCAodEf1E-CfUUm8u1O_fJzBlb8snwKcM4",
  authDomain: "move-up-fit.firebaseapp.com",
  projectId: "move-up-fit",
  storageBucket: "move-up-fit.firebasestorage.app",
  messagingSenderId: "1013909436676",
  appId: "1:1013909436676:web:0237a9b8b5170806fcf851",
  measurementId: "G-ZCGZ6K2ZZM"
};

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase inicializado com sucesso');
} catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    alert('Erro: Configure as credenciais do Firebase no arquivo firebase-config.js');
}

let db, auth;

try {
    if (firebase.firestore) {
        db = firebase.firestore();
        console.log('Firestore inicializado');
    } else {
        console.error('Firestore não está disponível');
    }
    
    if (firebase.auth) {
        auth = firebase.auth();
        console.log('Auth inicializado');
    } else {
        console.error('Auth não está disponível');
    }
} catch (error) {
    console.error('Erro ao inicializar serviços:', error);
}

// Database online usando Firebase
class FirebaseDatabase {
    static async salvarPeca(peca) {
        try {
            const docRef = await db.collection('pecas').add({
                ...peca,
                dataCadastro: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Erro ao salvar peça:", error);
            throw error;
        }
    }

    static async obterPecas() {
        try {
            const snapshot = await db.collection('pecas').orderBy('dataCadastro', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Erro ao obter peças:", error);
            return [];
        }
    }

    static async atualizarPeca(pecaId, dadosAtualizados) {
        try {
            await db.collection('pecas').doc(pecaId).update({
                ...dadosAtualizados,
                dataAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Peça atualizada:', pecaId);
        } catch (error) {
            console.error("Erro ao atualizar peça:", error);
            throw error;
        }
    }

    static async salvarMarca(marca) {
        try {
            const docRef = await db.collection('marcas').add({
                ...marca,
                dataCadastro: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Erro ao salvar marca:", error);
            throw error;
        }
    }

    static async obterMarcas() {
        try {
            const snapshot = await db.collection('marcas').orderBy('nomeMarca').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Erro ao obter marcas:", error);
            return [];
        }
    }

    static escutarMarcas(callback) {
        return db.collection('marcas').orderBy('nomeMarca').onSnapshot(callback);
    }

    static async criarUsuario(uid, email, nivel = 'usuario') {
        try {
            await db.collection('usuarios').doc(uid).set({
                email: email,
                nivel: nivel,
                dataCriacao: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
        }
    }

    static async obterNivelUsuario(uid) {
        try {
            const doc = await db.collection('usuarios').doc(uid).get();
            return doc.exists ? doc.data().nivel : 'usuario';
        } catch (error) {
            console.error("Erro ao obter nível:", error);
            return 'usuario';
        }
    }

    static async atualizarNivelUsuario(uid, nivel) {
        try {
            await db.collection('usuarios').doc(uid).set({
                nivel: nivel,
                dataCriacao: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log('Nível atualizado para:', nivel);
        } catch (error) {
            console.error("Erro ao atualizar nível:", error);
        }
    }

    static async obterUsuarios() {
        try {
            const snapshot = await db.collection('usuarios').orderBy('email').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Erro ao obter usuários:", error);
            return [];
        }
    }

    static async excluirUsuario(uid) {
        try {
            // Excluir do Firestore
            await db.collection('usuarios').doc(uid).delete();
            console.log('Usuário excluído do Firestore:', uid);
            
            // NOTA: Não é possível excluir do Firebase Auth pelo frontend
            // O usuário permanece no Authentication mas não consegue acessar o sistema
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            throw error;
        }
    }

    static async atualizarMarca(id, marca) {
        try {
            await db.collection('marcas').doc(id).update({
                ...marca,
                dataAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Marca atualizada:', id);
        } catch (error) {
            console.error("Erro ao atualizar marca:", error);
            throw error;
        }
    }

    static async excluirMarca(id) {
        try {
            await db.collection('marcas').doc(id).delete();
            console.log('Marca excluída:', id);
        } catch (error) {
            console.error("Erro ao excluir marca:", error);
            throw error;
        }
    }

    static async atualizarEstoque(pecaId, novoEstoque) {
        try {
            await db.collection('pecas').doc(pecaId).update({
                estoque: novoEstoque
            });
            console.log('Estoque atualizado:', pecaId, novoEstoque);
            
            // Verificar se estoque zerou
            if (novoEstoque === 0) {
                // Buscar dados da peça para mostrar no alerta
                const pecaDoc = await db.collection('pecas').doc(pecaId).get();
                if (pecaDoc.exists) {
                    const peca = pecaDoc.data();
                    console.warn(`ESTOQUE ESGOTADO: ${peca.nome} (${peca.codigo})`);
                    
                    // Mostrar alerta se estivermos na página de vendas
                    if (typeof window !== 'undefined' && window.location.pathname.includes('vendas.html')) {
                        alert(`⚠️ ATENÇÃO: Estoque da peça "${peca.nome}" (${peca.codigo}) foi esgotado!`);
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar estoque:", error);
            throw error;
        }
    }

    static async registrarVenda(venda) {
        try {
            const docRef = await db.collection('vendas').add(venda);
            console.log('Venda registrada:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Erro ao registrar venda:", error);
            throw error;
        }
    }

    static async obterVendas() {
        try {
            const snapshot = await db.collection('vendas').orderBy('dataVenda', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Erro ao obter vendas:", error);
            return [];
        }
    }

    static async obterVendaPorId(vendaId) {
        try {
            const doc = await db.collection('vendas').doc(vendaId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error("Erro ao obter venda:", error);
            throw error;
        }
    }

    static async excluirVenda(vendaId) {
        try {
            await db.collection('vendas').doc(vendaId).delete();
            console.log('Venda excluída:', vendaId);
        } catch (error) {
            console.error("Erro ao excluir venda:", error);
            throw error;
        }
    }

    static async atualizarVenda(vendaId, venda) {
        try {
            await db.collection('vendas').doc(vendaId).update({
                ...venda,
                dataAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Venda atualizada:', vendaId);
        } catch (error) {
            console.error("Erro ao atualizar venda:", error);
            throw error;
        }
    }

    static async registrarHistorico(acao, detalhes, usuario) {
        try {
            await db.collection('historico').add({
                acao: acao,
                detalhes: detalhes,
                usuario: usuario,
                data: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Erro ao registrar histórico:", error);
        }
    }

    static async limparHistoricoAntigo() {
        try {
            const treseMesesAtras = new Date();
            treseMesesAtras.setMonth(treseMesesAtras.getMonth() - 3);
            
            const snapshot = await db.collection('historico')
                .where('data', '<', treseMesesAtras)
                .get();
            
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            console.log('Histórico antigo limpo:', snapshot.docs.length, 'registros');
        } catch (error) {
            console.error("Erro ao limpar histórico:", error);
        }
    }

    static async obterHistorico() {
        try {
            const snapshot = await db.collection('historico').orderBy('data', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Erro ao obter histórico:", error);
            return [];
        }
    }

    static async buscarClientePorCPF(cpf) {
        try {
            const snapshot = await db.collection('vendas')
                .where('cliente.cpf', '==', cpf)
                .limit(1)
                .get();
            
            if (!snapshot.empty) {
                return snapshot.docs[0].data().cliente;
            }
            return null;
        } catch (error) {
            console.error("Erro ao buscar cliente:", error);
            return null;
        }
    }

    static async buscarClientesPorNome(nomeInicial) {
        try {
            const snapshot = await db.collection('vendas').get();
            const clientes = new Map();
            
            snapshot.docs.forEach(doc => {
                const cliente = doc.data().cliente;
                if (cliente && cliente.nome && cliente.cpf) {
                    const nomeUpper = cliente.nome.toUpperCase();
                    const buscaUpper = nomeInicial.toUpperCase();
                    if (nomeUpper.startsWith(buscaUpper)) {
                        clientes.set(cliente.cpf, cliente);
                    }
                }
            });
            
            return Array.from(clientes.values()).slice(0, 5);
        } catch (error) {
            console.error("Erro ao buscar clientes por nome:", error);
            return [];
        }
    }

    static async registrarRetirada(retirada) {
        try {
            const docRef = await db.collection('vendas').add(retirada);
            console.log('Retirada registrada:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Erro ao registrar retirada:", error);
            throw error;
        }
    }

    static async registrarPagamentoParcela(pagamento) {
        try {
            const docRef = await db.collection('pagamentos_parcelas').add({
                ...pagamento,
                dataPagamento: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Pagamento de parcela registrado:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Erro ao registrar pagamento de parcela:", error);
            throw error;
        }
    }

    static async obterPagamentosParcelas() {
        try {
            const snapshot = await db.collection('pagamentos_parcelas').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Erro ao obter pagamentos de parcelas:", error);
            return [];
        }
    }

    static async salvarMaquina(maquina) {
        try {
            const docRef = await db.collection('maquinas').add({
                ...maquina,
                dataCadastro: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Erro ao salvar máquina:", error);
            throw error;
        }
    }

    static async obterMaquinas() {
        try {
            const snapshot = await db.collection('maquinas').orderBy('nome').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Erro ao obter máquinas:", error);
            return [];
        }
    }

    static async atualizarMaquina(id, maquina) {
        try {
            await db.collection('maquinas').doc(id).update({
                ...maquina,
                dataAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Erro ao atualizar máquina:", error);
            throw error;
        }
    }

    static async excluirMaquina(id) {
        try {
            await db.collection('maquinas').doc(id).delete();
        } catch (error) {
            console.error("Erro ao excluir máquina:", error);
            throw error;
        }
    }

    static async cadastrarPix(pix) {
        try {
            console.log('FirebaseDatabase.cadastrarPix chamado com:', pix);
            
            if (!db) {
                throw new Error('Database não inicializado');
            }
            
            const docRef = await db.collection('pix').add(pix);
            console.log('PIX salvo com sucesso, ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Erro ao cadastrar PIX:", error);
            throw error;
        }
    }

    static async obterPix() {
        try {
            const snapshot = await db.collection('pix').orderBy('dataCadastro', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Erro ao obter PIX:", error);
            return [];
        }
    }

    static async obterPixPrincipal() {
        try {
            const snapshot = await db.collection('pix').limit(1).get();
            return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        } catch (error) {
            console.error("Erro ao obter PIX principal:", error);
            return null;
        }
    }

    static async atualizarPix(id, pix) {
        try {
            await db.collection('pix').doc(id).update({
                ...pix,
                dataAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Erro ao atualizar PIX:", error);
            throw error;
        }
    }

    static async excluirPix(id) {
        try {
            await db.collection('pix').doc(id).delete();
        } catch (error) {
            console.error("Erro ao excluir PIX:", error);
            throw error;
        }
    }

    static async salvarContaPagar(conta) {
        try {
            const docRef = await db.collection('contas_pagar').add({
                ...conta,
                dataCadastro: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Erro ao salvar conta a pagar:", error);
            throw error;
        }
    }

    static async obterContasPagar() {
        try {
            const snapshot = await db.collection('contas_pagar').orderBy('dataCadastro', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Erro ao obter contas a pagar:", error);
            return [];
        }
    }

    static async toggleParcelaPaga(contaId, numeroParcela) {
        try {
            const contaRef = db.collection('contas_pagar').doc(contaId);
            const doc = await contaRef.get();
            
            if (doc.exists) {
                const conta = doc.data();
                const parcelas = conta.parcelas.map(parcela => {
                    if (parcela.numero === numeroParcela) {
                        return {
                            ...parcela,
                            paga: !parcela.paga,
                            dataPagamento: !parcela.paga ? new Date().toISOString() : null
                        };
                    }
                    return parcela;
                });
                
                await contaRef.update({ parcelas });
            }
        } catch (error) {
            console.error("Erro ao atualizar parcela:", error);
            throw error;
        }
    }
}