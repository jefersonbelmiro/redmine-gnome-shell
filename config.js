/**
 * core: /usr/share/gnome-shell/js/ui 
 */



let config = {

    uri : 'http://redmine.dbseller:8888',
    query : 18,
    listeners : [

        {
            description : 'Bugs atribuidos a mim, que não estão em teste' 
            style : 'color:red',
            find : [
                {tracker.name : 'bug'},
                {method : '!ilike', status.name : 'em teste'}
                {assigned_to.name : 'jeferson belmiro'}
                {custom_fields.name : 'prioridade'}
                {custom_fields.value : 'tendencia a piorar longo prazo'}
            ]
            find : [
                {
                    method : '!ilike',
                    tracker.name : 'bug',
                    status.name : 'em teste',
                    assigned_to.name : 'jeferson belmiro',
                    custom_fields.name : 'prioridade'
                    custom_fields.value : 'tendencia a piorar longo prazo'
                }
            ]
        },

        { find : {tracker.name : 'acerto'}  },
        { find : {tracker.name : 'bug'}  },
        { find : {assigned_to : 'jeferson belmiro'} }

        { 
            find : [
                {status.name : 'em teste'},
                {method : 'ilike', assigned_to.name : 'jeferson belmiro'},
            ]
        }

    ]

};


let default = {
    "project": { "id": undefined, "name": undefined },
    "tracker": { "id": undefined, "name": undefined },
    "status": { "id": undefined, "name": undefined, },
    "priority": { "id": undefined, "name": undefined },
    "author": { "id": undefined, "name": undefined },
    "assigned_to": { "id": undefined, "name": undefined },
    "fixed_version": { "id": undefined, "name": undefined },
    "subject": undefined,
    "description": undefined,
    "start_date": undefined,
    "done_ratio": undefined,
    "custom_fields": [ { "id": undefined, "name": undefined, "value": undefined }, ],
    "created_on": "2014-03-13T21:12:55Z",
    "updated_on": "2014-03-18T13:55:56Z"
}



// estrutura
{
  "issues": [
    {
      "id": 386,
      "project": {
        "id": 61,
        "name": "Compras"
      },
      "tracker": {
        "id": 3,
        "name": "Bug"
      },
      "status": {
        "id": 9,
        "name": "Em Desenvolvimento"
      },
      "priority": {
        "id": 2,
        "name": "Normal"
      },
      "author": {
        "id": 28,
        "name": "Renan Rocha"
      },
      "assigned_to": {
        "id": 17,
        "name": "Jeferson Belmiro"
      },
      "fixed_version": {
        "id": 19,
        "name": "2.3.20"
      },
      "subject": "90804 - registro de preço",
      "description": "INSTITUIÇÃO: Osório\r\n\r\nRegistro de preço, primeira vez que escolho material para inclusão o campo quantidade restante nos mostra o saldo do material, porém após para inclusão de outro item o campo traz a quantidade 1 e não o seu saldo.\r\nO campo quantidade restante, deve mostrar o saldo do item para o departamento no registro de preço em questão.\r\n\r\n============================================================================================================\r\n\r\nVerificação retaguarda:\r\n\r\nO saldo é atualizado via requisição ajax, só que o formulário é carregado por um post que sobrescreve o saldo a partir do sql contido na variável $sql_dot no fonte db_frmsolicitem.php. \r\n\r\nSugestão de correção: inserir o seguinte trecho de código no fonte db_frmsolicitemiframe.php após a linha 961: if ( !empty(parent.document.getElementById('pc16_codmater').value) ) { parent.js_buscarQuantidadeRestanteItemEstimativa(); } \r\n",
      "start_date": "2014-03-13",
      "done_ratio": 0,
      "custom_fields": [
        {
          "id": 6,
          "name": "Gravidade",
          "value": "3 - Grave"
        },
        {
          "id": 7,
          "name": "Urgência",
          "value": "3 - Urgente"
        },
        {
          "id": 8,
          "name": "Tendência",
          "value": "2 - Piorar em Longo Prazo"
        },
        {
          "id": 5,
          "name": "Item de Menu",
          "value": "PROCESSO DE COMPRAS > PROCEDIMENTOS > CADASTRO DE SOLICITAÇÕES > INCLUSÃO"
        },
        {
          "id": 9,
          "name": "Passos para Reproduzir",
          "value": "procedimentos > cadastro de solicitação > inclusão\r\n\r\nbase dev13 homologação marica relase 21\r\n\r\nacessar a alteração da solicitação 6379 depart 142\r\nclicar na âncora cod do material escolher um dos materiais, logo o campo \"Quantidade restante\" deve mostrar o saldo do item."
        },
        {
          "id": 10,
          "name": "Responsável Atendimento",
          "value": "PERES, HENRIQUE KNEWITZ PERES"
        }
      ],
      "created_on": "2014-03-13T21:12:55Z",
      "updated_on": "2014-03-18T13:55:56Z"
    },
  ],
  "total_count": 4,
  "offset": 0,
  "limit": 25
}

