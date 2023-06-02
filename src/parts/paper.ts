import { MyObject3D } from "../webgl/myObject3D";
import vs from '../glsl/paper.vert';
import fs from '../glsl/paper.frag';
import vs2 from '../glsl/base.vert';
import fs2 from '../glsl/bg.frag';
import { Mesh, PlaneGeometry, RawShaderMaterial, DoubleSide, UniformsUtils, Vector2, Color, ShaderMaterial } from 'three';
import { TexLoader } from "../webgl/texLoader";
import { Conf } from "../core/conf";
import { Param } from "../core/param";
import { Util } from "../libs/util";

export class Paper extends MyObject3D {

  private _id: number;
  private _bg: Mesh;
  private _paper: Array<Mesh> = [];

  private _rate: number = 0;
  public get rate(): number {
    return this._rate;
  }
  public set rate(r: number) {
    this._rate = r;
  }

  constructor(id: number) {
    super();

    this._id = id;

    const tex = TexLoader.instance.get(Conf.instance.PATH_IMG + 't-' + this._id + '.png')

    this._bg = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        vertexShader:vs2,
        fragmentShader:fs2,
        side:DoubleSide,
        depthTest:false,
        uniforms:{
          tDiffuse:{value: tex},
        }
      })
    );
    this.add(this._bg);
    this._bg.renderOrder = 0;

    const geo = new PlaneGeometry(1, 1, 64, 128)
    const num = 1
    for(let i = 0; i < num; i++){
      const it = 1 / num;
      const uni = {
        tDiffuse:{value:null, type:'t'},
        col:{value: new Color(0xffffff)},
        angle:{value: 0},
        alpha:{value: 1},
        progress:{value: 0},
        radOffset:{value: 1},
        rollsOffset:{value: 1},
        range:{value: new Vector2(i * it, i * it + it)},
      }

      const p = new Mesh(
        geo,
        new RawShaderMaterial({
          vertexShader: vs,
          fragmentShader: fs,
          side: DoubleSide,
          depthTest: false,
          uniforms: UniformsUtils.merge([
            uni,
          ])
        })
      )
      this.add(p);
      p.renderOrder = 1 + (num - i);
      this._getUni(p).tDiffuse.value = tex
      this._paper.push(p)
    }
  }


  protected _update():void {
    super._update();

    const paperParam = Param.instance.paper;
    const rate = 1 - Util.map(this._rate, 0, 0.75, 0, 1);

    this._paper.forEach((p) => {
      const uni = this._getUni(p);
      uni.angle.value = Util.radian(45 + Math.sin(Util.radian(this._id * 10 + this._c * 2)) * 10);
      uni.progress.value = rate + Math.cos(Util.radian(this._id * 10 + this._c * 5)) * 0.01;
      uni.radOffset.value = paperParam.radOffset.value * 0.01;
      uni.rollsOffset.value = paperParam.rollsOffset.value * 0.01;
      // uni.alpha.value = Util.map(this._rate, 1, 0, 0.5, 1);
    })
  }
}