<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CategoryModel as MainModel;
use App\Http\Requests\CategoryRequest as MainRequest ;
use Illuminate\Support\Str;

class CategoryController extends AdminController
{
    public function __construct()
    {
        $this->pathViewController = 'admin.pages.category.';
        $this->controllerName = 'category';
        $this->model = new MainModel();
        parent::__construct();
    }

    public function form(Request $request)
    {
        $item = null;
        $title = ' - Add';
        if ($request->id != null) {
            $this->params['id'] = $request->id;
            $item = $this->model->getItem($this->params, ['task' => 'get-item']);
            $title = ' - Edit';
        }
        $nodes = $this->model->listItems($this->params, ['task' => 'admin-list-items-in-select-box']);
        return view($this->pathViewController . 'form', compact('item', 'nodes'));
    }

    public function save(MainRequest $request)
    {
        if ($request->method() == 'POST') {
            $params = $request->all();
            if(empty($params['slug'])){
                $params['slug']=Str::slug($params['name']);
            }




            $task   = "add-item";
            $notify = "Thêm phần tử thành công!";

            if($params['id'] !== null) {
                $task   = "edit-item";
                $notify = "Cập nhật phần tử thành công!";
            }
            $this->model->saveItem($params, ['task' => $task]);
            return redirect()->route($this->controllerName)->with("zvn_notify", $notify);
        }
    }

    public function isHome(Request $request)
    {
        $params["currentIsHome"]  = $request->isHome;
        $params["id"]             = $request->id;
        $params['controllerName'] = $this->controllerName;

        $result = $this->model->saveItem($params, ['task' => 'change-is-home']);
        echo json_encode($result);
    }

    public function display(Request $request) {
        $params["currentDisplay"]   = $request->display;
        $params["id"]               = $request->id;
        $result = $this->model->saveItem($params, ['task' => 'change-display']);
        echo json_encode($result);
    }

    public function ordering(Request $request)
    {
        $this->params['ordering'] = $request->ordering;
        $this->params['id'] = $request->id;
        $result = $this->model->saveItem($this->params, ['task' => 'change-ordering']);
        echo json_encode($result);
    }

    public function move(Request $request)
    {
        $params['type'] = $request->type;
        $params['id'] = $request->id;
        $this->model->move($params, null);
        return redirect()->route($this->controllerName);
    }
}