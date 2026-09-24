const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const openModalButton = document.querySelector('.addIngred');
const closeModalButton = document.querySelector('.close-modal');
const nameSelect = document.getElementById('nomeIngred');
const percentSelect = document.getElementById('quantIngred');
const gramsLabel = document.getElementById('gramaDoIngred');
const ovenSelect = document.getElementById('tipoForno');
const flourInput = document.getElementById('pesoFarinha');
const categorySelect = document.getElementById('categoriaReceita');
const tablePlacement = document.getElementById('tablePlace');
const imageInput = document.getElementById('imgReceita');
const imagePreview = document.getElementById('imagePreview');
const uploadPlaceholder = document.querySelector('.upload-placeholder');
const ingredients = [];

// Faixas compiladas do PDF. Todas as porcentagens usam farinha = 100%.
const rules = {
  acucar: { label: 'Açúcar', ranges: { massaSalgada:[0,4,1], massaSemiDoce:[5,14,1], sobremessa:[15,25,1] } },
  sal: { label:'Sal', values:{massaSalgada:[2], massaSemiDoce:[2], sobremessa:[1.5]} },
  fermentoFresco:{label:'Fermento Biológico Fresco',ranges:{massaSalgada:[1,5,.5],massaSemiDoce:[1,5,.5],sobremessa:[4,10,.5]}},
  fermentoSeco:{label:'Fermento Biológico Seco',ranges:{massaSalgada:[.1,2.5,.1],massaSemiDoce:[1,3.5,.1],sobremessa:[3,5,.1]}},
  agua:{label:'Água',ranges:{massaSalgada:[58,60,.5],massaSemiDoce:[58,60,.5],sobremessa:[58,60,.5]}},
  gordura:{label:'Gordura',ranges:{massaSalgada:[0,4,1],massaSemiDoce:[5,10,1],sobremessa:[5,10,1]}},
  leite:{label:'Leite líquido',ranges:{massaSalgada:[0,60,5],massaSemiDoce:[0,60,5],sobremessa:[0,60,5]}},
  leitePo:{label:'Leite em pó',ranges:{massaSalgada:[0,6,.5],massaSemiDoce:[0,6,.5],sobremessa:[0,6,.5]}},
  aditivoPo:{label:'Aditivo em pó',values:{massaSalgada:[1],massaSemiDoce:[1],sobremessa:[1]}},
  aditivoPasta:{label:'Aditivo em pasta',values:{massaSalgada:[.3],massaSemiDoce:[.3],sobremessa:[.3]}},
  aditivoLiquido:{label:'Aditivo líquido',values:{massaSalgada:[.2],massaSemiDoce:[.2],sobremessa:[.2]}},
  claraOvo:{label:'Ovos (clara)',ranges:{massaSalgada:[5,10,.5],massaSemiDoce:[5,10,.5],sobremessa:[5,10,.5]}},
  gemaOvo:{label:'Ovos (gema)',ranges:{massaSalgada:[10,20,.5],massaSemiDoce:[10,20,.5],sobremessa:[10,20,.5]}}
};
const records = {
  massaSalgada: {acucar:[0,4,1], sal:[2], fermentoFresco:[1,5,.5], fermentoSeco:[.1,2.5,.1], agua:[58,60,.5], gordura:[0,4,1], leite:[0,60,5], leitePo:[0,6,.5], aditivoPo:[1], aditivoPasta:[.3], aditivoLiquido:[.2], claraOvo:[5,10,.5], gemaOvo:[10,20,.5]},
  massaSemiDoce: {acucar:[5,14,1], sal:[2], fermentoFresco:[1,5,.5], fermentoSeco:[1,3.5,.1], agua:[58,60,.5], gordura:[5,10,1], leite:[0,60,5], leitePo:[0,6,.5], aditivoPo:[1], aditivoPasta:[.3], aditivoLiquido:[.2], claraOvo:[5,10,.5], gemaOvo:[10,20,.5]},
  sobremessa: {acucar:[15,25,1], sal:[1.5], fermentoFresco:[4,10,.5], fermentoSeco:[3,5,.1], agua:[58,60,.5], gordura:[5,10,1], leite:[0,60,5], leitePo:[0,6,.5], aditivoPo:[1], aditivoPasta:[.3], aditivoLiquido:[.2], claraOvo:[5,10,.5], gemaOvo:[10,20,.5]}
};
function availableValues(id) {
  const rule = rules[id]; const category = categorySelect.value;
  if (!rule || !category) return [];
  if (rule.values) return rule.values[category] || [];
  const [min,max,step] = rule.ranges[category];
  const out=[];
  for(let value=min; value<=max+1e-8; value=+(value+step).toFixed(4)) out.push(value);
  return out;
}
function fillPercentOptions() {
  percentSelect.innerHTML='';
  const values=availableValues(nameSelect.value);
  if(!values.length){percentSelect.innerHTML='<option value="">Selecione um ingrediente primeiro</option>';percentSelect.disabled=true;return;}
  percentSelect.innerHTML='<option value="">Selecione a quantidade</option>';
  values.forEach(value=>{const option=document.createElement('option');option.value=String(value);option.textContent=`${value}%`;percentSelect.append(option);});
  percentSelect.disabled=false;
}
function totalPercent(){return 100+ingredients.reduce((sum,item)=>sum+item.percent,0);}
function refreshSummary(){
  const flour=Number(flourInput.value)||0; const pct=totalPercent(); const dough=flour*pct/100;
  document.getElementById('massaTotal').textContent=flour>0?`${dough.toLocaleString('pt-BR',{maximumFractionDigits:1})} g`:'—';
  document.getElementById('percentualTotal').textContent=`${pct.toFixed(1)}%`;
  const unit=Number(document.getElementById('pesoUnidade').value)||0;
  document.getElementById('rendimento').textContent=unit>0?`${Math.floor(dough/unit)} unidades`:'Informe peso cru';
  ingredients.forEach(item=>{const cell=tablePlacement.querySelector(`[data-ingredient="${item.id}"] .grams`);if(cell)cell.textContent=`${(flour*item.percent/100).toLocaleString('pt-BR',{maximumFractionDigits:1})} g`;});
}

function renderTable(){
  tablePlacement.replaceChildren();
  const table=document.createElement('table');
  table.innerHTML='<thead><tr><th>Nome do ingrediente</th><th>Porcentagem</th><th>Quantidade em grama</th><th>Tipo</th><th></th></tr></thead>';
  const tbody=document.createElement('tbody'); const flour=Number(flourInput.value)||0;
  ingredients.forEach((item,index)=>{
    const row=document.createElement('tr');row.dataset.ingredient=item.id;
    const cells=[item.label,`${item.percent}%`,`${(flour*item.percent/100).toLocaleString('pt-BR',{maximumFractionDigits:1})} g`,item.oven];
    cells.forEach((value,i)=>{const cell=document.createElement('td');cell.textContent=value;if(i===2)cell.className='grams';row.append(cell);});
    const action=document.createElement('td');const remove=document.createElement('button');remove.type='button';remove.className='remove-ingredient';remove.textContent='Remover';remove.addEventListener('click',()=>{ingredients.splice(index,1);renderTable();});action.append(remove);row.append(action);tbody.append(row);
  });
  if(!ingredients.length){const row=document.createElement('tr');const cell=document.createElement('td');cell.colSpan=5;cell.textContent='Adicione ingredientes para calcular a massa.';row.append(cell);tbody.append(row);}
  table.append(tbody);tablePlacement.append(table);refreshSummary();
}

function closeModal(){modal.classList.add('hidden');overlay.classList.add('hidden');document.querySelector('.hero').style.filter='';}
openModalButton.addEventListener('click',()=>{
  if(!categorySelect.value){alert('Selecione primeiro a categoria da massa.');return;}
  modal.classList.remove('hidden');overlay.classList.remove('hidden');document.querySelector('.hero').style.filter='blur(5px)';
});

closeModalButton.addEventListener('click',closeModal);
overlay.addEventListener('click',event=>{if(!event.target.closest('.modal-body'))closeModal();});
nameSelect.addEventListener('change',()=>{fillPercentOptions();gramsLabel.textContent='';});
percentSelect.addEventListener('change',()=>{
  const pct=Number(percentSelect.value),flour=Number(flourInput.value)||0;
  gramsLabel.textContent=pct>0?`${(flour*pct/100).toLocaleString('pt-BR',{maximumFractionDigits:1})} g`:'Selecione uma porcentagem maior que zero.';
  gramsLabel.style.display='block';gramsLabel.style.backgroundColor='#e8c9a0';
});

[flourInput,document.getElementById('pesoUnidade')].forEach(input=>input.addEventListener('input',refreshSummary));
categorySelect.addEventListener('change',()=>{nameSelect.value='';fillPercentOptions();});

document.getElementById('calcularEncomenda').addEventListener('click',()=>{
  const units=Number(document.getElementById('qtdEncomenda').value),unit=Number(document.getElementById('pesoUnidade').value);
  if(!(units>0&&unit>0)){alert('Informe a quantidade desejada e o peso cru por unidade.');return;}
  const requiredFlour=units*unit*100/totalPercent();flourInput.value=requiredFlour.toFixed(1);renderTable();
  document.getElementById('farinhaEncomenda').textContent=`${requiredFlour.toLocaleString('pt-BR',{maximumFractionDigits:1})} g`;
});

document.querySelector('.save-ingred').addEventListener('click',event=>{
  event.preventDefault();const id=nameSelect.value,pct=Number(percentSelect.value);
  if(!id||!pct||!ovenSelect.value){alert('Selecione ingrediente, percentual e tipo de forno.');return;}
  if(ingredients.some(item=>item.id===id)){alert('Esse ingrediente já foi adicionado.');return;}
  ingredients.push({id,label:rules[id].label,percent:pct,oven:ovenSelect.options[ovenSelect.selectedIndex].text});
  renderTable();nameSelect.value='';percentSelect.innerHTML='<option value="">Selecione um ingrediente primeiro</option>';percentSelect.disabled=true;gramsLabel.textContent='';closeModal();
});
imageInput.addEventListener('change',()=>{
  const file=imageInput.files[0];if(!file)return;
  if(!['image/jpeg','image/png'].includes(file.type)){alert('Selecione uma imagem JPG ou PNG.');imageInput.value='';return;}
  if(file.size>5*1024*1024){alert('A imagem deve ter no máximo 5 MB.');imageInput.value='';return;}
  imagePreview.src=URL.createObjectURL(file);imagePreview.hidden=false;if(uploadPlaceholder)uploadPlaceholder.hidden=true;
});

renderTable();

