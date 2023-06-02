import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Update } from '../libs/update';
import { Object3D } from 'three';
import { Param } from '../core/param';
import { Paper } from './paper';
import { Tween } from '../core/tween';
import { Scroller } from '../core/scroller';
import { Util } from '../libs/util';

export class Visual extends Canvas {

  private _con:Object3D;
  private _paper: Array<Paper> = [];
  private _h: HTMLElement;

  constructor(opt: any) {
    super(opt);

    this._h = document.querySelector('.js-height') as HTMLElement;

    this._con = new Object3D();
    this.mainScene.add(this._con);

    const num = 5;
    for(let i = 0; i < num; i++) {
      const p = new Paper(i);
      this._con.add(p);
      this._paper.push(p);
    }

    this._resize();
  }


  protected _update(): void {
    super._update();

    // const w = Func.instance.sw();
    const h = Func.instance.sh();
    const total = h * 5;

    Tween.instance.set(this._h, {
      height: total,
    })

    const scroll = Util.map(Func.instance.val(Scroller.instance.val.y, Scroller.instance.easeVal.y), 0, 1, 0, total - h);

    const it = Func.instance.val(0.65, 0.65);
    const num = this._paper.length;
    this._paper.forEach((p, i) => {
      p.position.y = i * -it - it;
      const rateIt = 1 / num;
      p.rate = Util.map(scroll, 0, 1, rateIt * i - rateIt * 2, rateIt * i + rateIt);
    })
    this._con.position.y = Util.map(scroll, 0, it * num, 0, 1);

    this.cameraPers.position.z = Param.instance.camera.z.value * 0.01 * Func.instance.val(2, 1.5);

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.render(this.mainScene, this.cameraPers);
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0
  }


  _resize(): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);

    this.cameraPers.fov = 45;
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();
  }
}
