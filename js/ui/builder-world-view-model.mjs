export function nextWorldChallenge(checkpoints){
  const available=checkpoints.filter(point=>!point.disabled && String(point.text||'').trim());
  const next=available.find(point=>!point.complete) || null;
  return {next,complete:available.filter(point=>point.complete).length,total:available.length,
    text:next?next.text:'You finished your challenges! Try one small improvement.'};
}
export function toggleWorldPanel(current,requested){return current===requested?null:requested;}
