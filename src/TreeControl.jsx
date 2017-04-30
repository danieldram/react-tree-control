import React, {Component} from 'react'
import {global} from './_global'

const styles = global.styles;
const floatLeft = styles.float();
const merge = styles.merge;
const inlineBlock = styles.display("inline-block");


export class TreeControl extends Component {

  _traverse = (comparator) => {
    let ChildTabs = this.props.tabs
    const cached_childtabs = []
    cached_childtabs.push(ChildTabs)
    const condition = cached_childtabs.length > 0

    const loop = () => {
      const childtab = cached_childtabs.length ? cached_childtabs.shift() : null
      const left = () => childtab.forEach(tab => {
        Array.isArray(tab.ChildTabs) ? comparator(tab, this.props.tabs) : null;
        Array.isArray(tab.ChildTabs) && tab.ChildTabs.length ? cached_childtabs.push(tab.ChildTabs) : null;
        condition ? loop() : exit()
      })
      const right = () => null;
      childtab ? left() : right()
    }

    const exit = () => null

    loop();
    return;
  }

  _mapToParentTabs = (parent, fn) => {
    const condition = (par) => Object.keys(par).length > 0

    const loop = () => {
      parent ? fn(parent) : null
      parent = parseInt(parent.TabId) !== -1  ? this.props.findParent(parent) : {}
      condition(parent) ? loop() : exit()
    }
    const exit = () => null
    loop()
    return

  }

  _mapToChildTabs = (tab, fn) => {
    let ChildTabs = tab.ChildTabs
    const cached_childtabs = []
    cached_childtabs.push(ChildTabs)
    const condition = cached_childtabs.length > 0

    const loop = () => {
      const childtab = cached_childtabs.length ? cached_childtabs.shift() : null
      const left = () => childtab.forEach(tab => {
        Array.isArray(tab.ChildTabs) ? fn(tab) : null
        Array.isArray(tab.ChildTabs) && tab.ChildTabs.length ? cached_childtabs.push(tab.ChildTabs) : null
        condition ? loop() : exit()
      })
      const right = () => null
      childtab ? left() : right()
    }
    const exit = () => null

    loop()
    return
  }

  setCheckedState = (tab) => {
    const set = () => tab.HasChildren ? this.selectParent(tab) : this.selectIndividual(tab)
    tab.CheckedState ? this.resetCheckedState(tab) : set()
  }


  mapParentCheckedState = (parent) => {
      const ChildTabs = parent.ChildTabs || []
      const length = ChildTabs.length
      const checkedArray = []
      const truthyChecked = parent.ChildTabs.map(tab => tab.CheckedState==this.props.fullyChecked ?  checkedArray.push(true) : checkedArray.push(false) )

      checkedArray.indexOf(false) !== -1 ? parent.CheckedState=this.props.individuallyChecked : parent.CheckedState=this.props.fullyChecked

      debugger;
      this.props.updateTree(parent)
      debugger;
  }

  resetCheckedState = (tab) => {

    const unselectChildren = (childtab) => {
      childtab.CheckedState = this.props.unchecked
      childtab.ChildrenSelected=false;
      this.props.updateTree(childtab)
      const parent = this.props.findParent(tab)
      this.setParentCheckedState(parent)
      this._mapToParentTabs(parent, this.mapParentCheckedState)
    }

    const unselectIndividual = () => {
      tab.CheckedState = this.props.unchecked
      tab.ChildrenSelected=false;
      this.props.updateTree(tab)
      const parent = this.props.findParent(tab)
      this.setParentCheckedState(parent)
      this._mapToParentTabs(parent, this.mapParentCheckedState)


    }

    tab.HasChildren ? this._mapToChildTabs(tab, unselectChildren) : unselectIndividual()
    tab.CheckedState = this.props.unchecked
    tab.ChildrenSelected = false;

    this.props.updateTree(tab)
  }

  setParentCheckedState(parent){
    const ChildTabs = parent.ChildTabs || []
    const length = ChildTabs.length
    const checkedArray = []

    const checkParent= () => {
        parent.ChildrenSelected=true
        switch (true) {
          case checkedArray.filter(bool => !!bool).length === length:
            parent.CheckedState=this.props.fullyChecked
            this.props.updateTree(parent)
            this._mapToParentTabs(parent, this.mapParentCheckedState)

          return
          case checkedArray.indexOf(true) !== -1:
            parent.CheckedState=this.props.individuallyChecked
            this.props.updateTree(parent)
            this._mapToParentTabs(parent, this.mapParentCheckedState)

          return

        }

      this.props.updateTree(parent)

    }

    const noChildrenSelected = () => {
        parent.ChildrenSelected=false
    }

    ChildTabs.forEach(tab => tab.CheckedState ? checkedArray.push(true) : checkedArray.push(false))
    checkedArray.indexOf(true) !== -1 ? checkParent() : noChildrenSelected()
  }



  selectParent = (tab) => {
    const select = (tab) => {
        switch(true){
          case tab.HasChildren===true:
            tab.CheckedState=this.props.fullyChecked
            tab.ChildrenSelected=true;
            this.props.updateTree(tab)

          return
          case tab.HasChildren===false:
            tab.CheckedState=this.props.individuallyChecked
            tab.ChildrenSelected=false
            this.props.updateTree(tab)

          return
        }
    }
    tab.CheckedState = this.props.fullyChecked
    tab.ChildrenSelected = true
    this._mapToChildTabs(tab, select)
    this.props.updateTree(tab)
    const parent = this.props.findParent(tab)
    this.setParentCheckedState(parent)
  }

  selectIndividual = (tab) => {
      tab.CheckedState=this.props.individuallyChecked
      tab.ChildrenSelected=false
      this.props.updateTree(tab)
      const parent = this.props.findParent(tab)
      this.setParentCheckedState(parent)
      this._mapToParentTabs(parent, this.mapParentCheckedState)
  }


  expandParent = (tab) => {
    const condition = tab.HasChildren && tab.ChildTabs.length > 0
    const left = () => tab.IsOpen = !tab.IsOpen

    const right = () => {
        console.log('do async request from interactor')
        tab.IsOpen = !tab.IsOpen
    }
    condition ? left() : right()
    this.props.updateTree(tab)
  }

  render_checkbox = (tab) => {
    const render = ( () => {
      return (
        <input type="checkbox" onChange={ ()=>this.setCheckedState(tab) } checked={tab.CheckedState} ></input>
      )
    })();
    return render
  }

  render_bullet = (tab) => {
    const render = ( () => {
      const style = {width:'10px', height:'10px', backgroundColor:'blue', float:'left'}
      return ( <div onClick={()=>this.expandParent(tab)} style={style}></div> )
    })();
    return render
  }

  render_li = (tabs)=> {
    const render = (() => {
      return tabs.map( tab => {
        const checkbox = this.render_checkbox(tab);
        const bullet = this.render_bullet(tab);
        const tree = this.render_tree(tab.ChildTabs);
        const li = () => (
              <li key={tab.Name}>
                {tab.HasChildren ? bullet:null}
                {checkbox}
                {tab.Name}
                {tab.CheckedState && tab.HasChildren ? <span>*</span> : <span></span>}
                {tree}
              </li>)
        const parent = this.props.findParent(tab)

        const show = parent.IsOpen || parseInt(tab.TabId)===-1 ? li() : null
        return(
          show
        )
      });
    })();
    return render
  }

  render_tree(ChildTabs) {
    const render = (()=>{
      return (
        <TreeControl
            tabs={ChildTabs}
            updateTree={this.props.updateTree.bind(this)}
            findParent={this.props.findParent.bind(this)}
            fullyChecked={this.props.fullyChecked}
            individuallyChecked={this.props.individuallyChecked}
            unchecked={this.props.unchecked}

            />
      )
    })();
    return render
  }


  render() {
    const list_items = this.render_li(this.props.tabs);

    return (
      <ul>
        {list_items}
      </ul>
    )
  }

}
