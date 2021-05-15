<?php

namespace App\Models;

use App\Models\AdminModel;
use App\Models\RouteModel;
use Illuminate\Support\Facades\DB; 

class ControllerModel extends AdminModel
{

    public $timestamps = false;

    public function __construct()
    {
        $this->table               = 'controller';
        $this->folderUpload        = 'controller';
        $this->fieldSearchAccepted = ['id', 'name'];
        $this->crudNotAccepted     = [
            '_token'
        ];
    }
    
    public function listItems($params = null, $options = null) {
        $result = null;

        if($options['task'] == "admin-list-items") {
            $query = self::select(
                'id', 'name', 'status', 'controller', 'route_id',
                'created' , 'created_by', 'modified', 'modified_by');

            $result =  $query
                ->orderBy('id', 'desc')
                ->paginate($params['pagination']['totalItemsPerPage']);
                // ->get()->toArray();
        }

        if($options['task'] == 'admin-list-items-get-all-controller') {
            $query = self::select(
                'id', 'name', 'controller', 'status'
            );

            $result =  $query
                ->where('status', 'active')
                ->orderBy('id', 'desc')
                ->paginate($params['pagination']['totalItemsPerPage'])
                // ->get()->toArray()
            ;

            // echo '<pre style="color:red";>$result === '; print_r($result);echo '</pre>';
            // echo '<h3>Die is Called </h3>';die;
        }

        if($options['task'] == 'admin-list-items-get-all-route') 
        {
            $model  = new RouteModel();
            $items = $model->listItems($params, ['task' => 'admin-list-items-get-all-route']);

            foreach ($items as $key => $value) 
            {
                        $keyC  = $value['id'];
                $result[$keyC] = $items[$key];
            }

            // echo '<pre style="color:red";>$result === '; print_r($result);echo '</pre>';
            // echo '<h3>Die is Called Controller Model</h3>';die;
        }
        
        return $result;
    }

    public function countItems($params = null, $options  = null) {
        $result = null;

        if($options['task'] == 'admin-count-items-group-by-status') {
         
            $query = $this::groupBy('status')
                        ->select( DB::raw('status , COUNT(id) as count') );

            if ($params['search']['value'] !== "")  {
                if($params['search']['field'] == "all") {
                    $query->where(function($query) use ($params){
                        foreach($this->fieldSearchAccepted as $column){
                            $query->orWhere($column, 'LIKE',  "%{$params['search']['value']}%" );
                        }
                    });
                } else if(in_array($params['search']['field'], $this->fieldSearchAccepted)) { 
                    $query->where($params['search']['field'], 'LIKE',  "%{$params['search']['value']}%" );
                } 
            }

            $result = $query->get()->toArray();
        }

        return $result;
    }

    public function getItem($params = null, $options = null) { 
        $result = null;
        
        if($options['task'] == 'get-item') {
            $result = self::select('id', 'name', 'controller', 'status')->where('id', $params['id'])->first();
        }

        return $result;
    }

    public function saveItem($params = null, $options = null) {
        $modifiedBy = session('userInfo')['username'];
        $modified   = date('Y-m-d H:i:s');
        $createdBy  = session('userInfo')['username'];
        $created    = date('Y-m-d H:i:s');

        /*================================= change ajax status =============================*/
        if($options['task'] == 'change-status') {

            $status = ($params['currentStatus'] == "active") ? "inactive" : "active";
            self::where('id', $params['id'])->update(['status' => $status ]);

            return  [
                'id'      => $params['id'],
                'status'  => [
                    'name'  => config("zvn.template.status.$status.name"),
                    'class' => config("zvn.template.status.$status.class")
                ],
                'link'    => route($params['controllerName'] . '/status', ['status' => $status, 'id' => $params['id']]),
                'message' => config('zvn.notify.success.update')
            ];
        }

        if($options['task'] == 'add-item') {
            $params['created_by'] = $createdBy;
            self::insert($this->prepareParams($params));        
        }

        if($options['task'] == 'edit-item') {
            $params['modified_by'] = $modifiedBy;
            $params['modified']    = $modified;
            self::where('id', $params['id'])->update($this->prepareParams($params));
        }

    }

    public function deleteItem($params = null, $options = null) 
    { 
        if($options['task'] == 'delete-item') {
            $item   = self::getItem($params, ['task'=>'get-avatar']); // 
            $this->deleteThumb($item['thumb']);
            self::where('id', $params['id'])->delete();
        }
    }

}

