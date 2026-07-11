Português | [English](README-en.md)

<p align="center">
    <img src="resources/icon.png" alt="Logotipo do programa" width="200">
</p>

<h1 align="center">
    Guicu
</h1>

<p align="center">
    <a href="https://github.com/carvalho-jefferson/guicu/releases/latest">
        <img src="https://img.shields.io/badge/Version-1.3.0-%231d6d58?style=flat" alt="Version">
    </a>
    <a href="https://github.com/carvalho-jefferson/guicu/blob/main/LICENSE">
        <img src="https://img.shields.io/badge/License-AGPL--3.0-%23114537?style=flat" alt="License">
    </a>
</p>

<p align="center">
    Crie, edite, analise e exporte currículos offline, com total segurança e privacidade.
</p>

## Descrição

Guicu é um gerador de currículos focado em compatibilidade com sistemas ATS (Applicant Tracking System) — os softwares utilizados pela maioria das empresas para filtrar candidatos automaticamente antes de qualquer análise humana.

Este projeto prioriza o que de fato te faz passar pelo primeiro filtro: densidade de palavras-chave, estrutura do documento, compatibilidade com parsers (analisadores) e completude das seções.

❇️ [Baixar : Windows, macOS e Linux](https://github.com/carvalho-jefferson/guicu/releases/latest)

> Aviso para usuários Windows: ao instalar, o Windows pode exibir um alerta 
> do SmartScreen. Clique em "Mais informações" e depois em "Executar assim mesmo". 
> Isso acontece porque o programa ainda não tem certificado digital.

## Funcionalidades

- Recursos totalmente otimizados para análise em ATS: fontes, formatação e muito mais
- Pontuação do currículo baseada em [critérios reais](#otimização-ats) usados por plataformas ATS em parsing (análise) e ranqueamento de candidatos
- Criação de currículo guiada por etapas em todas as seções
- Exportação para PDF e DOCX
- Modo escuro automático baseado na preferência do sistema operacional
- Salvamento automático com armazenamento local em JSON
- Gerenciamento de múltiplos currículos
- Totalmente offline, seus dados protegidos, você no controle de tudo

## Capturas de tela

<p align="center">
  <img src="assets/editor.png" width="30%">
  <img src="assets/curriculo-gerado.png" width="30%">
  <img src="assets/painel-analise.png" width="30%">
</p>

## Otimização ATS

| Critério                                  | Peso   |
| ----------------------------------------- | ------ |
| Habilidades e cobertura de palavras-chave | 35 pts |
| Experiência profissional                  | 25 pts |
| Informações de contato                    | 12 pts |
| Resumo profissional com palavras-chave    | 10 pts |
| Formação acadêmica                        | 5 pts  |
| Certificações                             | 5 pts  |
| Título profissional                       | 5 pts  |
| Projetos                                  | 3 pts  |


## Como executar

```bash
git clone https://github.com/carvalho-jefferson/guicu.git
cd guicu
npm install
npm run dev
```

<details>
<summary>Para gerar um instalador</summary>

```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

</details>

## Por que usar o Guicu?

Geradores gratuitos de currículo muitas vezes travam funcionalidades úteis atrás de assinaturas, otimizam para design visual em detrimento da compatibilidade com ATS ou até mesmo podem compartilhar/vender seus dados pessoais para outras empresas. Nesse contexto, o Guicu se torna algo realmente útil e necessário: uma ferramenta prática, segura, offline e open-source para quem precisa fazer seu currículo passar pela triagem automatizada e ter muito mais chances de conquistar a vaga desejada.

## Licença

Licença AGPL-3.0. Veja [LICENSE](LICENSE) para mais detalhes.

## Autor

Jefferson Carvalho

[GitHub](https://github.com/carvalho-jefferson) | [LinkedIn](https://www.linkedin.com/in/1jefferson-carvalho/)

> *Este projeto está em evolução. Feedbacks, sugestões e contribuições são bem-vindos!*
